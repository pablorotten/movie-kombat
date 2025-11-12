// Mapping of genre names to emojis
const genreEmojiMap: Record<string, string> = {
  'Action': '💥',
  'Adventure': '🗺️',
  'Animation': '🎨',
  'Comedy': '😂',
  'Crime': '🕵️',
  'Documentary': '📽️',
  'Drama': '🎭',
  'Family': '👨‍👩‍👧‍👦',
  'Fantasy': '🧙‍♂️',
  'History': '📚',
  'Horror': '👻',
  'Music': '🎵',
  'Mystery': '🔍',
  'Romance': '💕',
  'Science Fiction': '🚀',
  'TV Movie': '📺',
  'Thriller': '😱',
  'War': '⚔️',
  'Western': '🤠'
};

export const getGenreEmoji = (genreName: string): string => {
  return genreEmojiMap[genreName] || '🎬';
};

export const getGenreWithEmoji = (genreName: string): string => {
  const emoji = getGenreEmoji(genreName);
  return `${emoji} ${genreName}`;
};