"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useRealtimeTable(table: string, filter?: { column: string; value: string }) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let query = supabase.from(table).select('*');

    if (filter) {
      query = query.eq(filter.column, filter.value);
    }

    // Initial fetch
    query.then(({ data, error }) => {
      if (!error && data) {
        setData(data);
      }
      setIsLoading(false);
    });

    // Realtime subscription
    const channel = supabase
      .channel(`${table}_changes`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
        setData((prev) => {
          if (payload.eventType === 'INSERT') {
            return [...prev, payload.new];
          } else if (payload.eventType === 'UPDATE') {
            return prev.map((item) => (item.id === payload.new.id ? payload.new : item));
          } else if (payload.eventType === 'DELETE') {
            return prev.filter((item) => item.id !== payload.old.id);
          }
          return prev;
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filter?.column, filter?.value]);

  return { data, isLoading };
}

export function useSupabaseQuery(table: string, options?: { 
  select?: string; 
  eq?: { column: string; value: any };
  order?: { column: string; ascending?: boolean };
}) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let query = supabase.from(table).select(options?.select || '*');

    if (options?.eq) {
      query = query.eq(options.eq.column, options.eq.value);
    }

    if (options?.order) {
      query = query.order(options.order.column, { ascending: options.order.ascending ?? true });
    }

    query.then(({ data, error }) => {
      if (error) {
        setError(error);
      } else {
        setData(data || []);
      }
      setIsLoading(false);
    });
  }, [table, options?.select, options?.eq?.column, options?.eq?.value, options?.order?.column]);

  return { data, isLoading, error };
}