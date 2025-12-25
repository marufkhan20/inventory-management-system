import prisma from "../prisma";

// lib/actions/dashboard.ts
export async function getDashboardData() {
  // 1. Calculate Total Inventory Cost (What we own)
  const inventory = await prisma.inventory.findMany();

  const totalCostValue = inventory.reduce(
    (sum, item) => sum + item.inStock * Number(item.purchasePrice),
    0
  );

  // 2. Calculate Potential Revenue (What we will make)
  // Note: You'll need a 'retailPrice' field in Inventory for this
  const potentialRevenue = inventory.reduce(
    (sum, item) => sum + item.inStock * (Number(item.purchasePrice) || 0),
    0
  );

  // 3. Get Total Loss from Revisions in the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentRevisions = await prisma.revision.aggregate({
    _sum: { totalLoss: true },
    where: {
      status: "COMPLETED",
      date: { gte: sevenDaysAgo },
    },
  });

  const totalLossValue = recentRevisions._sum.totalLoss || 0;

  return {
    totalCostValue,
    potentialRevenue,
    totalLossValue,
    margin:
      potentialRevenue > 0
        ? ((potentialRevenue - totalCostValue) / potentialRevenue) * 100
        : 0,
  };
}
