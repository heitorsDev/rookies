"use client";

import { useQuery } from "@tanstack/react-query";
import { componentTypesApi, ComponentType } from "../api";

export function useComponentTypes() {
  return useQuery<ComponentType[]>({
    queryKey: ["componentTypes"],
    queryFn: () => componentTypesApi.list(),
  });
}

export function useComponentType(slug: string) {
  return useQuery<ComponentType>({
    queryKey: ["componentType", slug],
    queryFn: () => componentTypesApi.get(slug),
    enabled: !!slug,
  });
}