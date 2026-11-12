import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { getMe, login, logout, signup } from "../api/authApi";

/** Session = backend cookie + this query. `data === null` means logged out. */
export function useMe() {
  return useQuery({ queryKey: queryKeys.me, queryFn: getMe, staleTime: Infinity, retry: false });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: login, onSuccess: (user) => qc.setQueryData(queryKeys.me, user) });
}

export function useSignup() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: signup, onSuccess: (user) => qc.setQueryData(queryKeys.me, user) });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      qc.removeQueries({ predicate: (q) => q.queryKey[0] !== "me" });
      qc.setQueryData(queryKeys.me, null);
    },
  });
}
