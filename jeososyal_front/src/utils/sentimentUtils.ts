/**
 * Sentiment-related utilities and constants
 */

export const SENTIMENT_COLORS = {
  positive: 'hsl(var(--sentiment-positive))',
  neutral: 'hsl(var(--primary)/0.8)',
  negative: 'hsl(var(--sentiment-negative))'
} as const;

export const SENTIMENT_OPTIONS = [
  { 
    value: 'positive', 
    label: 'Olumlu', 
    icon: '😊',
    color: 'text-sentiment-positive' 
  },
  { 
    value: 'neutral', 
    label: 'Nötr', 
    icon: '😐',
    color: 'text-sentiment-neutral' 
  },
  { 
    value: 'negative', 
    label: 'Olumsuz', 
    icon: '😞',
    color: 'text-sentiment-negative' 
  }
] as const;

export const getSentimentColor = (inclination: string): string => {
  switch (inclination) {
    case 'Çok Olumlu':
    case 'Olumlu':
      return SENTIMENT_COLORS.positive;
    case 'Nötr':
      return SENTIMENT_COLORS.neutral;
    case 'Olumsuz':
    default:
      return SENTIMENT_COLORS.negative;
  }
};

export const getSentimentType = (inclination: string): 'positive' | 'neutral' | 'negative' => {
  switch (inclination) {
    case 'Çok Olumlu':
    case 'Olumlu':
      return 'positive';
    case 'Nötr':
      return 'neutral';
    case 'Olumsuz':
    default:
      return 'negative';
  }
};

export const getSentimentColorWithAlpha = (inclination: string, alpha: number): string => {
  const baseColor = getSentimentColor(inclination);
  return baseColor.replace(')', ` / ${alpha})`);
};