/**
 * App.tsx - PLACEBALL Spring Boot 통합 버전
 *
 * 원본: baseballai-bicevcq9/client/src/App.tsx
 * 변경사항:
 *  - Map.tsx (Google Maps) 컴포넌트 제거 (직접 사용 없음, 유지만)
 *  - Spring Boot WebSocket/REST 훅 연동 (useGameState, useChatbot)
 *  - ManusDialog 제거 (Manus 플랫폼 전용)
 */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import AppErrorBoundary from "./components/AppErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AppErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </AppErrorBoundary>
  );
}

export default App;
