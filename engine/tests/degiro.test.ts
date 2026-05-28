import { describe, expect, it } from "vitest";
import {
  aggregateDegiroTransactions,
  parseDegiroPortfolioCsv,
  parseDegiroTransactionsCsv,
  summarizeDegiroAccount,
} from "../src/index.js";

const portfolio = `Product,Symbol/ISIN,Amount,Closing,Local value,,Value in EUR
CASH & CASH FUND & FTX CASH (EUR),,,,EUR,"1079,92","1079,92"
ADR ON NICE LTD,US6536561086,13,"91,15",USD,"1184,95","1019,29"
NUTANIX INC CLASS A,US67059N1081,20,"46,57",USD,"931,40","801,19"
`;

const transactions = `Date,Time,Product,ISIN,Reference exchange,Venue,Quantity,Price,,Local value,,Value EUR,Exchange rate,AutoFX Fee,Transaction and/or third party fees EUR,Total EUR,Order ID,
28-05-2026,15:31,VERTEX INC CLASS A,US92538J1060,NDQ,XNAS,101,"12,6000",USD,"-1272,60",USD,"-1093,96","1,1633","-2,73",,"-1096,70",,07bedc06-f3a5-4975-944e-a52aa46ccef5
28-05-2026,15:30,VERTEX INC CLASS A,US92538J1060,NDQ,XNAS,1,"12,6000",USD,"-12,60",USD,"-10,83","1,1633","-0,03","-2,00","-12,86",,07bedc06-f3a5-4975-944e-a52aa46ccef5
28-05-2026,15:30,NUTANIX INC CLASS A,US67059N1081,NDQ,XNAS,20,"46,0100",USD,"-920,20",USD,"-791,03","1,1633","-1,98","-2,00","-795,01",,8fd72898-1bd6-42c8-82d2-2e91378cbfb3
`;

describe("DEGIRO CSV parsing", () => {
  it("parses portfolio rows with decimal-comma values", () => {
    const rows = parseDegiroPortfolioCsv(portfolio);
    expect(rows[0]).toMatchObject({ isCash: true, valueEur: 1079.92 });
    expect(rows[1]).toMatchObject({
      product: "ADR ON NICE LTD",
      isin: "US6536561086",
      amount: 13,
      closing: 91.15,
      currency: "USD",
      localValue: 1184.95,
      valueEur: 1019.29,
    });
    expect(summarizeDegiroAccount(rows)).toEqual({
      totalValueEur: 2900.4,
      cashEur: 1079.92,
      positionsValueEur: 1820.48,
      positions: [rows[1], rows[2]],
    });
  });

  it("parses split-fill transactions and aggregates fees/cost", () => {
    const rows = parseDegiroTransactionsCsv(transactions);
    expect(rows[0]).toMatchObject({
      date: "2026-05-28",
      quantity: 101,
      price: 12.6,
      valueEur: -1093.96,
      totalEur: -1096.7,
      orderId: "07bedc06-f3a5-4975-944e-a52aa46ccef5",
    });

    const byIsin = aggregateDegiroTransactions(rows);
    expect(byIsin.get("US92538J1060")).toMatchObject({
      quantity: 102,
      averagePrice: 12.6,
      totalCostEur: 1109.56,
      totalFeesEur: 4.76,
      firstDate: "2026-05-28",
    });
    expect(byIsin.get("US67059N1081")).toMatchObject({
      quantity: 20,
      averagePrice: 46.01,
      totalCostEur: 795.01,
      totalFeesEur: 3.98,
    });
  });
});
