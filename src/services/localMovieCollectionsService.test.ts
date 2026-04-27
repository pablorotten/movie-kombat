import { describe, expect, it } from "vitest";
import {
  parseCollectionMovieTitles,
  parseCollectionTitle,
  shuffle,
} from "./localMovieCollectionsService";

describe("parseCollectionTitle", () => {
  it("extracts first markdown heading", () => {
    const markdown = "# Creator watchlist\n\n* Movie A\n* Movie B\n";

    expect(parseCollectionTitle(markdown, "Fallback")).toBe("Creator watchlist");
  });

  it("uses fallback when heading is missing", () => {
    const markdown = "Movie A\nMovie B\n";

    expect(parseCollectionTitle(markdown, "Fallback")).toBe("Fallback");
  });
});

describe("parseCollectionMovieTitles", () => {
  it("parses bullets/plain lines and removes case-insensitive duplicates", () => {
    const markdown = "# A List\n\n* Movie A\n- Movie B\nMovie C\nmovie c\n";

    expect(parseCollectionMovieTitles(markdown)).toEqual([
      "Movie A",
      "Movie B",
      "Movie C",
    ]);
  });
});

describe("shuffle", () => {
  it("keeps all original elements", () => {
    const items = ["A", "B", "C", "D"];
    const randomValues = [0.9, 0.2, 0.7, 0.1];
    let idx = 0;

    const result = shuffle(items, () => {
      const value = randomValues[idx % randomValues.length];
      idx += 1;
      return value;
    });

    expect(result.slice().sort()).toEqual(items.slice().sort());
  });
});
