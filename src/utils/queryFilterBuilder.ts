export function buildProductFilter(query: any) {
  const filter: any = {};

  if (query.type) filter.type = query.type;
  if (query.newProduct === "true") filter.newProduct = true;
  if (query.popularProduct === "true") filter.popularProduct = true;
  if (query.category) filter.category = query.category;

  const searchStr = typeof query.search === "string" ? query.search : "";
  if (searchStr.trim() !== "") {
    filter.name = { $regex: new RegExp(searchStr, "i") };
  }

  let attributeQuery: Record<string, string | string[]> = {};
  if (query.attributes) {
    try {
      attributeQuery = JSON.parse(query.attributes);
    } catch (e) {
      console.error("Failed to parse attributes JSON:", e);
      attributeQuery = {};
    }
  }

  const attributeKeys = Object.keys(attributeQuery);

  if (attributeKeys.length > 0) {
    filter.$and = attributeKeys.map((key) => {
      const raw = attributeQuery[key];
      const values = Array.isArray(raw)
        ? raw
        : typeof raw === "string"
        ? raw.split(",")
        : [String(raw)];

      return {
        attributes: {
          $elemMatch: {
            name: key,
            values: { $all: values },
          },
        },
      };
    });
  }

  return filter;
}
