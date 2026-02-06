import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#8B5CF6',
            light: '#A78BFA',
            dark: '#7C3AED',
        },
        secondary: {
            main: '#EC4899',
            light: '#F472B6',
            dark: '#DB2777',
        },
        background: {
            default: '#F3F4F6',
            paper: '#FFFFFF',
        },
        text: {
            primary: '#1F2937',
            secondary: '#6B7280',
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h4: {
            fontWeight: 700,
        },
        h6: {
            fontWeight: 600,
        },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
            },
        },
    },
});

export const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#A78BFA',
            light: '#C4B5FD',
            dark: '#8B5CF6',
        },
        secondary: {
            main: '#F472B6',
            light: '#FBCFE8',
            dark: '#EC4899',
        },
        background: {
            default: '#0F172A',
            paper: '#1E293B',
        },
        text: {
            primary: '#F1F5F9',
            secondary: '#94A3B8',
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h4: {
            fontWeight: 700,
        },
        h6: {
            fontWeight: 600,
        },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backgroundColor: '#1E293B',
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                },
            },
        },
    },
});

// Graph-specific color schemes
export const graphColors = {
    light: {
        background: '#FFFFFF',
        grid: '#E5E7EB',
        node: {
            PERSON: '#EF4444',
            ORG: '#3B82F6',
            GPE: '#10B981',
            DATE: '#F59E0B',
            PRODUCT: '#8B5CF6',
            EVENT: '#EC4899',
            WORK_OF_ART: '#14B8A6',
            LOC: '#6366F1',
            MONEY: '#F97316',
        },
        edge: '#94A3B8',
        text: '#1F2937',
    },
    dark: {
        background: '#0F172A',
        grid: '#334155',
        node: {
            PERSON: '#F87171',
            ORG: '#60A5FA',
            GPE: '#34D399',
            DATE: '#FBBF24',
            PRODUCT: '#A78BFA',
            EVENT: '#F472B6',
            WORK_OF_ART: '#2DD4BF',
            LOC: '#818CF8',
            MONEY: '#FB923C',
        },
        edge: '#64748B',
        text: '#F1F5F9',
    },
};
