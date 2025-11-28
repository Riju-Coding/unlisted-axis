/**
 * Centralized Color Theme Configuration
 * Update colors here to change the entire website theme
 */

export const themeColors = {
    // Your custom color palette
    primary: "#3A59D1", // Deep blue - main brand color
    secondary: "#3D90D7", // Medium blue - secondary actions
    accent: "#7AC6D2", // Light blue-teal - accents and highlights
    success: "#06fa58ff", // Light green - success states and positive actions
    error: "#DC2626", // Red for decrease/error states
  
    // Derived colors for different use cases
    primaryHover: "#2E47B8", // Darker primary for hover states
    secondaryHover: "#2A7BC4", // Darker secondary for hover states
    accentHover: "#5FB8C4", // Darker accent for hover states
    successHover: "#9DFAB8", // Darker success for hover states
    errorHover: "#B91C1C", // Darker red for hover
  
    // Light variants for backgrounds
    primaryLight: "#E8EEFF", // Very light primary for backgrounds
    secondaryLight: "#E8F4FF", // Very light secondary for backgrounds
    accentLight: "#E8F8FA", // Very light accent for backgrounds
    successLight: "#F0FFF4", // Very light success for backgrounds
    errorLight: "#FEE2E2", // Light red for backgrounds
  
    // Dark variants for dark mode
    primaryDark: "#1E2A5E", // Dark primary for dark mode
    secondaryDark: "#1E4A6B", // Dark secondary for dark mode
    accentDark: "#2D5A66", // Dark accent for dark mode
    successDark: "#2D4A33", // Dark success for dark mode
    errorDark: "#7F1D1D", // Dark red for dark mode
  
    // Neutral colors
    neutralLight: "#F9FAFB", // Very light gray
    neutralMedium: "#6B7280", // Medium gray for text
    neutralDark: "#374151", // Dark gray for text
    neutralDarker: "#1F2937", // Very dark gray
  
    // Text colors
    textPrimary: "#111827", // Primary text color
    textSecondary: "#6B7280", // Secondary text color
    textLight: "#9CA3AF", // Light text color
    textWhite: "#FFFFFF", // White text
  
    // Background colors
    backgroundWhite: "#FFFFFF",
    backgroundLight: "#F9FAFB",
    backgroundDark: "#111827",
    backgroundDarker: "#0F172A",
  } as const
  
  /**
   * CSS Custom Properties for dynamic theming
   * These can be used in Tailwind classes or CSS
   */
  export const cssVariables = {
    "--color-primary": themeColors.primary,
    "--color-secondary": themeColors.secondary,
    "--color-accent": themeColors.accent,
    "--color-success": themeColors.success,
    "--color-error": themeColors.error,
    "--color-primary-hover": themeColors.primaryHover,
    "--color-secondary-hover": themeColors.secondaryHover,
    "--color-accent-hover": themeColors.accentHover,
    "--color-success-hover": themeColors.successHover,
    "--color-error-hover": themeColors.errorHover,
    "--color-primary-light": themeColors.primaryLight,
    "--color-secondary-light": themeColors.secondaryLight,
    "--color-accent-light": themeColors.accentLight,
    "--color-success-light": themeColors.successLight,
    "--color-error-light": themeColors.errorLight,
    "--color-primary-dark": themeColors.primaryDark,
    "--color-secondary-dark": themeColors.secondaryDark,
    "--color-accent-dark": themeColors.accentDark,
    "--color-success-dark": themeColors.successDark,
    "--color-error-dark": themeColors.errorDark,
    "--color-neutral-light": themeColors.neutralLight,
    "--color-neutral-medium": themeColors.neutralMedium,
    "--color-neutral-dark": themeColors.neutralDark,
    "--color-neutral-darker": themeColors.neutralDarker,
    "--color-text-primary": themeColors.textPrimary,
    "--color-text-secondary": themeColors.textSecondary,
    "--color-text-light": themeColors.textLight,
    "--color-text-white": themeColors.textWhite,
    "--color-background-white": themeColors.backgroundWhite,
    "--color-background-light": themeColors.backgroundLight,
    "--color-background-dark": themeColors.backgroundDark,
    "--color-background-darker": themeColors.backgroundDarker,
  } as const
  
  /**
   * Tailwind-compatible color classes
   * Use these in your className strings
   */
  export const colorClasses = {
    // Background colors
    bgPrimary: "bg-[var(--color-primary)]",
    bgSecondary: "bg-[var(--color-secondary)]",
    bgAccent: "bg-[var(--color-accent)]",
    bgSuccess: "bg-[var(--color-success)]",
    bgError: "bg-[var(--color-error)]",
  
    // Hover background colors
    hoverBgPrimary: "hover:bg-[var(--color-primary-hover)]",
    hoverBgSecondary: "hover:bg-[var(--color-secondary-hover)]",
    hoverBgAccent: "hover:bg-[var(--color-accent-hover)]",
    hoverBgSuccess: "hover:bg-[var(--color-success-hover)]",
    hoverBgError: "hover:bg-[var(--color-error-hover)]",
  
    // Text colors
    textPrimary: "text-[var(--color-text-primary)]",
    textSecondary: "text-[var(--color-text-secondary)]",
    textAccent: "text-[var(--color-accent)]",
    textSuccess: "text-[var(--color-success)]",
    textError: "text-[var(--color-error)]",
    textLight: "text-[var(--color-text-light)]",
    textWhite: "text-[var(--color-text-white)]",
  
    // Border colors
    borderPrimary: "border-[var(--color-primary)]",
    borderSecondary: "border-[var(--color-secondary)]",
    borderAccent: "border-[var(--color-accent)]",
    borderSuccess: "border-[var(--color-success)]",
    borderError: "border-[var(--color-error)]",
  
    // Light background colors
    bgPrimaryLight: "bg-[var(--color-primary-light)]",
    bgSecondaryLight: "bg-[var(--color-secondary-light)]",
    bgAccentLight: "bg-[var(--color-accent-light)]",
    bgSuccessLight: "bg-[var(--color-success-light)]",
    bgErrorLight: "bg-[var(--color-error-light)]",
  
    // Dark mode backgrounds
    darkBgPrimary: "dark:bg-[var(--color-primary-dark)]",
    darkBgSecondary: "dark:bg-[var(--color-secondary-dark)]",
    darkBgAccent: "dark:bg-[var(--color-accent-dark)]",
    darkBgSuccess: "dark:bg-[var(--color-success-dark)]",
    darkBgError: "dark:bg-[var(--color-error-dark)]",
  
    // Neutral colors
    bgNeutralLight: "bg-[var(--color-neutral-light)]",
    bgNeutralMedium: "bg-[var(--color-neutral-medium)]",
    bgNeutralDark: "bg-[var(--color-neutral-dark)]",
    bgNeutralDarker: "bg-[var(--color-neutral-darker)]",
    textNeutralMedium: "text-[var(--color-neutral-medium)]",
    textNeutralDark: "text-[var(--color-neutral-dark)]",
    textNeutralDarker: "text-[var(--color-neutral-darker)]",
  
    // Background colors
    bgWhite: "bg-[var(--color-background-white)]",
    bgLight: "bg-[var(--color-background-light)]",
    bgDark: "bg-[var(--color-background-dark)]",
    bgDarker: "bg-[var(--color-background-darker)]",
  } as const
  
  export const colors = {
    primary: {
      main: themeColors.primary,
      hover: themeColors.primaryHover,
      light: themeColors.primaryLight,
      dark: themeColors.primaryDark,
    },
    secondary: {
      main: themeColors.secondary,
      hover: themeColors.secondaryHover,
      light: themeColors.secondaryLight,
      dark: themeColors.secondaryDark,
    },
    accent: {
      main: themeColors.accent,
      hover: themeColors.accentHover,
      light: themeColors.accentLight,
      dark: themeColors.accentDark,
    },
    success: {
      main: themeColors.success,
      hover: themeColors.successHover,
      light: themeColors.successLight,
      dark: themeColors.successDark,
    },
    error: {
      main: themeColors.error,
      hover: themeColors.errorHover,
      light: themeColors.errorLight,
      dark: themeColors.errorDark,
    },
    neutral: {
      light: themeColors.neutralLight,
      medium: themeColors.neutralMedium,
      dark: themeColors.neutralDark,
      darker: themeColors.neutralDarker,
    },
    text: {
      primary: themeColors.textPrimary,
      secondary: themeColors.textSecondary,
      light: themeColors.textLight,
      white: themeColors.textWhite,
    },
    background: {
      white: themeColors.backgroundWhite,
      light: themeColors.backgroundLight,
      dark: themeColors.backgroundDark,
      darker: themeColors.backgroundDarker,
    },
  } as const
  