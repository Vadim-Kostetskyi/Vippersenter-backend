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

  return filter;
}
