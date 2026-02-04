import { geoService } from "./geo.service";
import { historyRepo } from "../repositories/history.repo";
import type { GeoSnapshot } from "./geo.service";

type SearchAndRecordInput = {
  userId: string;
  ip: string;
};

type ListByUserInput = {
  userId: string;
  limit?: number;
};

type DeleteManyInput = {
  userId: string;
  ids: string[];
};

async function searchAndRecord(input: SearchAndRecordInput): Promise<GeoSnapshot | null> {
  const { userId, ip } = input;

  // 1) Resolve geo (never throws; returns null on failure/private IP)
  const geo = await geoService.resolve(ip);

  // 2) Persist history (must not block returning geo)
  try {
    await historyRepo.createSearchHistory({
      userId,
      ip,
      geo, // Json snapshot (nullable)
    });
  } catch {
    // Intentionally ignore persistence failure to avoid breaking UX
  }

  return geo;
}

async function listByUser(input: ListByUserInput) {
  const { userId, limit } = input;
  return historyRepo.listSearchHistories({
    userId,
    limit,
  });
}

async function deleteMany(input: DeleteManyInput): Promise<number> {
  const { userId, ids } = input;
  if (!ids.length) return 0;

  return historyRepo.deleteSearchHistories({
    userId,
    ids,
  });
}

export const historyService = {
  searchAndRecord,
  listByUser,
  deleteMany,
};

export default historyService;
