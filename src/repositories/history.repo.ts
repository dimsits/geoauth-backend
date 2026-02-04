import prisma from "../lib/prisma";

type CreateSearchHistoryInput = {
  userId: string;
  ip: string;
  geo: unknown | null; // stored as Json snapshot
};

type ListSearchHistoriesInput = {
  userId: string;
  limit?: number;
};

type DeleteSearchHistoriesInput = {
  userId: string;
  ids: string[];
};

async function createSearchHistory(input: CreateSearchHistoryInput) {
  const { userId, ip, geo } = input;

  return prisma.searchHistory.create({
    data: {
      userId,
      ip,
      geo: geo ?? undefined,
    },
    select: {
      id: true,
      userId: true,
      ip: true,
      geo: true,
      createdAt: true,
    },
  });
}

async function listSearchHistories(input: ListSearchHistoriesInput) {
  const { userId, limit } = input;

  const take =
    typeof limit === "number" && Number.isFinite(limit)
      ? Math.max(1, Math.min(limit, 100))
      : 50;

  return prisma.searchHistory.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      ip: true,
      geo: true,
      createdAt: true,
    },
  });
}

async function deleteSearchHistories(input: DeleteSearchHistoriesInput): Promise<number> {
  const { userId, ids } = input;

  if (!ids.length) return 0;

  const result = await prisma.searchHistory.deleteMany({
    where: {
      userId,
      id: { in: ids },
    },
  });

  return result.count;
}

export const historyRepo = {
  createSearchHistory,
  listSearchHistories,
  deleteSearchHistories,
};

export default historyRepo;
