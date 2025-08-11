import { ThemeProvider as ThemeProviderComponent } from "@/hooks/use-theme";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: "dark" | "light" | "system";
  storageKey?: string;
};

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <ThemeProviderComponent {...props}>
      {children}
    </ThemeProviderComponent>
  );
}
