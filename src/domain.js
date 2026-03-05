import { randomBytes } from 'node:crypto';

export const adjectives = [
  'happy', 'sunny', 'swift', 'calm', 'bold', 'bright', 'cool', 'warm',
  'quick', 'clever', 'brave', 'gentle', 'kind', 'proud', 'wise', 'keen',
  'fresh', 'crisp', 'pure', 'clear', 'wild', 'free', 'silent', 'quiet',
  'golden', 'silver', 'coral', 'amber', 'jade', 'ruby', 'pearl', 'onyx'
];

export const nouns = [
  'tiger', 'eagle', 'wolf', 'bear', 'hawk', 'fox', 'deer', 'owl',
  'river', 'mountain', 'forest', 'ocean', 'meadow', 'valley', 'canyon', 'island',
  'star', 'moon', 'cloud', 'storm', 'wind', 'flame', 'wave', 'stone',
  'maple', 'cedar', 'pine', 'oak', 'willow', 'birch', 'aspen', 'elm'
];

export function generateSubdomain() {
  return `${adjectives[randomBytes(1)[0] % adjectives.length]}-${nouns[randomBytes(1)[0] % nouns.length]}-${randomBytes(4).toString('hex')}`;
}

export function isValidSubdomain(value) {
  const parts = value.split('-');
  return parts.length === 3
    && adjectives.includes(parts[0])
    && nouns.includes(parts[1])
    && /^[0-9a-f]{8}$/.test(parts[2]);
}
