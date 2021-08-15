Calculates the interest from YouHodler converted to AUD at date received.

Usage:

0. npm install

1. Prepare AUD/USD file:
a. https://au.investing.com/currencies/usd-aud-historical-data 
b. set date range for the table. Daily, Full Year
c. copy table and save as `input/usd-aud.txt`

2. Get YH transactions
a. https://app.youhodler.com/history?limit=100&offset=0
b. Adjust limit as neccessary
c. Open dev tools and copy the json response for the page 
d. Save as `input/YH.json` file. 

3. Edit filenames in yhToAud.ts

4. `npm start`
5. Copy results to google sheets 


Assumptions:
- When I receive interest in YH, its considered as two different taxable events:

1. "Income" - declared as the value of the coin in AUD (using market value). In this case, I'm assuming fair value for stable coins (USDC/USDT) to be 1:1 with the AUD-USD pair. I've put this under "Other Income" in my tax return. 
2. Gain of a Asset (the coin) with a cost-base of this income price.

When this asset is disposed (sold/traded), then we need to calculate the price (in AUD) after selling it, and pay CGT on that price - the cost base from (1).

Based on the advice for staking rewards in 2021:
https://community.ato.gov.au/t5/Cryptocurrency/Staking-rewards/td-p/37024



