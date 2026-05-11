"use client";

import { useQuery } from "@tanstack/react-query";
import { componentTypesApi, type ComponentType } from "@/features/component-types/api";

export function useComponentTypes() {
  return useQuery<ComponentType[]>({
    queryKey: ["componentTypes"],
    queryFn: componentTypesApi.list,
  });
}
