import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { initSync } from "@/lib/sync";

export const getRouter = () => {
  const queryClient = new QueryClient();

  // Initialize cross-app sync (only active in demo mode)
  initSync(queryClient);

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    basepath: "/demo/order-management/",
  });

  return router;
};
