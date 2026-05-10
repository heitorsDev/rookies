import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { membersApi } from "../api";

export function useMembers() {
  return useQuery({
    queryKey: ["members"],
    queryFn: () => membersApi.list(),
  });
}

export function useCreateMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; username: string }) =>
      membersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
}