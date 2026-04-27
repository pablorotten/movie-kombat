export interface LocalMovieCollection {
  id: string;
  title: string;
  movieTitles: string[];
  filePath: string;
  image?: string;
}

const markdownModules = import.meta.glob<string>(
  "../../movies/*.md",
  {
    eager: true,
    query: "?raw",
    import: "default",
  }
);

export const shuffle = <T,>(items: T[], randomFn: () => number = Math.random): T[] => {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(randomFn() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const getFileNameFromPath = (filePath: string): string => {
  const withNoDirs = filePath.split("/").pop() ?? filePath;
  return withNoDirs.replace(/\.md$/i, "");
};

export const parseCollectionTitle = (markdown: string, fallbackTitle: string): string => {
  const headingLine = markdown
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => /^#\s+/.test(line));

  if (!headingLine) {
    return fallbackTitle;
  }

  return headingLine.replace(/^#\s+/, "").trim() || fallbackTitle;
};

export const parseCollectionMovieTitles = (markdown: string): string[] => {
  const lines = markdown
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .filter((line) => !/^#\s+/.test(line))
    .filter((line) => !/<img/.test(line));

  const normalizedToOriginal = new Map<string, string>();

  for (const line of lines) {
    const withoutListPrefix = line.replace(/^[-*+]\s+/, "").replace(/^\d+\.\s+/, "").trim();
    if (!withoutListPrefix) {
      continue;
    }

    const normalized = withoutListPrefix.toLowerCase();
    if (!normalizedToOriginal.has(normalized)) {
      normalizedToOriginal.set(normalized, withoutListPrefix);
    }
  }

  return Array.from(normalizedToOriginal.values());
};

export const parseCollectionImage = (markdown: string): string | undefined => {
  const imgMatch = markdown.match(/<img[^>]+src=["']([^"']+)["']/);
  return imgMatch ? imgMatch[1] : undefined;
};

export const loadLocalMovieCollections = (): LocalMovieCollection[] => {
  const collections: LocalMovieCollection[] = [];

  for (const [filePath, markdown] of Object.entries(markdownModules)) {
    const fileName = getFileNameFromPath(filePath);
    if (fileName.toLowerCase() === "readme") {
      continue;
    }

    const fallbackTitle = fileName
      .replace(/[-_]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const title = parseCollectionTitle(markdown, fallbackTitle);
    const movieTitles = parseCollectionMovieTitles(markdown);
    const image = parseCollectionImage(markdown);

    collections.push({
      id: fileName,
      title,
      movieTitles,
      filePath,
      image,
    });
  }

  return collections.sort((a, b) => a.title.localeCompare(b.title));
};
