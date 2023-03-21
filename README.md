# Swaps with flashloan

### Инструкция по запуску

1) Выполнить в терминале
```shell
npm install
```

2) В корне проекта добавить файл с названием `".env"` и с содержимым
```properties
ALCHEMY_API_KEY="ВАШ API КЛЮЧ ALCHEMY"
```

3) Выполнить в терминале
```shell
npx hardhat test
```

### Образец вывода теста
```
  flashloan
balance of owner: 10000000000000000000
==================================================================
balance of flashSwap: 10000000000000000000
==================================================================
ChainLink Token:
address: 0x514910771AF9Ca656af840dff83E8264EcF986CA
decimal: 18
reserves: 151025765736108308250934
normalize: 151025.76573610833Wrapped Ether:
address: 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
decimal: 18
reserves: 693648314260000740742
normalize: 693.6483142600007
uniswap contract ChainLink Token/Wrapped Ether address: 0xa2107FA5B38d9bbd2C461D6EDf11B11A50F6b974
ratio: 217.72671054095463
==================================================================
ChainLink Token:
address: 0x514910771AF9Ca656af840dff83E8264EcF986CA
decimal: 18
reserves: 36887266270529692856
normalize: 36.88726627052969Tether USD:
address: 0xdAC17F958D2ee523a2206206994597C13D831ec7
decimal: 6
reserves: 213500120
normalize: 213.50012
uniswap contract ChainLink Token/Tether USD address: 0x9Db10C305c671153662119D453C4D2c123725566
ratio: 172773983782.91165
==================================================================
Wrapped Ether:
address: 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
decimal: 18
reserves: 12251408825076098924969
normalize: 12251.4088250761Tether USD:
address: 0xdAC17F958D2ee523a2206206994597C13D831ec7
decimal: 6
reserves: 15343430235076
normalize: 15343430.235076
uniswap contract Wrapped Ether/Tether USD address: 0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852
ratio: 798479129.9841573
==================================================================
fee usdt: 
basisPointsRate = 0
maximumFee = 0
b1 = 10000000000000000
a1 = 2183850044627055691
b2 = 57689
b3 = 45925271969912
start swap function
start uniswapV2Call function
assert b1
assert b2
assert b3
you earn wei = -2183804119355085800
    ✔ swaps in uniswap (3298ms)
```
