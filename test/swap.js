const {ethers} = require("hardhat");
const IERC20 = require("@uniswap/v2-core/build/IERC20.json")
const IUniswapV2Pair = require("@uniswap/v2-core/build/IUniswapV2Pair.json")
const {BigNumber} = require("ethers");

const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
const LINK = "0x514910771AF9Ca656af840dff83E8264EcF986CA"
const USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7"

const UniswapV2Factory_address = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f"
const SEPARATOR = "=================================================================="

describe("flashloan", function () {
    it("swaps in uniswap", async function () {

        const [owner, _] = await ethers.getSigners();

        const helper = await ethers.deployContract("Helper", [UniswapV2Factory_address], owner);
        const flashSwap = await ethers.deployContract("FlashSwap", [UniswapV2Factory_address], owner);

        const WETH_contract = await ethers.getContractAt(IERC20.abi, WETH, owner);

        await owner.sendTransaction({
            to: WETH,
            value: ethers.utils.parseEther("10.0"), // Sends exactly 1.0 ether
        });

        console.log("balance of owner: " + await WETH_contract.balanceOf(owner.address));
        console.log(SEPARATOR);
        await WETH_contract.transfer(flashSwap.address, BigNumber.from("10000000000000000000"));
        console.log("balance of flashSwap: " + await WETH_contract.balanceOf(flashSwap.address));
        console.log(SEPARATOR);

        let tx = await helper.getPair(WETH, LINK);
        let receipt = await tx.wait();

        let event = receipt.events.find(event => event.event === 'GetPair');
        let [WETH_LINK_address] = event.args;

        tx = await helper.getPair(USDT, LINK);
        receipt = await tx.wait();

        event = receipt.events.find(event => event.event === 'GetPair');
        [USDT_LINK_address] = event.args;

        tx = await helper.getPair(USDT, WETH);
        receipt = await tx.wait();

        event = receipt.events.find(event => event.event === 'GetPair');
        [USDT_WETH_address] = event.args;

        const WETH_LINK_contract = await ethers.getContractAt(IUniswapV2Pair.abi, WETH_LINK_address, owner);
        const USDT_LINK_contract = await ethers.getContractAt(IUniswapV2Pair.abi, USDT_LINK_address, owner);
        const USDT_WETH_contract = await ethers.getContractAt(IUniswapV2Pair.abi, USDT_WETH_address, owner);

        const WETH_LINK_reserves = await WETH_LINK_contract.getReserves();
        const USDT_LINK_reserves = await USDT_LINK_contract.getReserves();
        const USDT_WETH_reserves = await USDT_WETH_contract.getReserves();

        console.log(await get_info(WETH_LINK_contract, owner));
        console.log(SEPARATOR);
        console.log(await get_info(USDT_LINK_contract, owner));
        console.log(SEPARATOR);
        console.log(await get_info(USDT_WETH_contract, owner));
        console.log(SEPARATOR);
        const abi = [
            "function basisPointsRate() public view returns (uint)",
            "function maximumFee() public view returns (uint)"]

        const USDTContract = new ethers.Contract(USDT, abi, owner);
        const basisPointsRate = await USDTContract.basisPointsRate();
        const maximumFee = await USDTContract.maximumFee();
        console.log(`fee usdt \nbasisPointsRate = ${basisPointsRate}\nmaximumFee = ${maximumFee}`);

        const b1 = BigNumber.from("10000000000000000");

        console.log("b1 = " + b1)

        const a1 = await WETH_LINK_contract.token0() === WETH ?
            await helper.getAmountIn(b1, WETH_LINK_reserves[1], WETH_LINK_reserves[0]) : await helper.getAmountIn(b1, WETH_LINK_reserves[0], WETH_LINK_reserves[1]);

        console.log("a1 = " + a1)

        const b2 = await USDT_LINK_contract.token0() === LINK ?
            await helper.getAmountOut(b1, USDT_LINK_reserves[0], USDT_LINK_reserves[1]) : await helper.getAmountOut(b1, USDT_LINK_reserves[1], USDT_LINK_reserves[0]);

        console.log("b2 = " + b2)

        const b3 = await USDT_LINK_contract.token0() === USDT ?
            await helper.getAmountOut(b2, USDT_WETH_reserves[0], USDT_WETH_reserves[1]) : await helper.getAmountOut(b2, USDT_WETH_reserves[1], USDT_WETH_reserves[0]);

        console.log("b3 = " + b3)

        if (await WETH_LINK_contract.token0() === WETH)
            await flashSwap.swap(WETH_LINK_contract.address, 0, b1, a1, b1, b2, b3, WETH, LINK, USDT);
        else
            await flashSwap.swap(WETH_LINK_contract.address, b1, 0, a1, b1, b2, b3, WETH, LINK, USDT);

        console.log("you earn wei = " + (b3 - a1))
    });
});

async function get_info(contract, owner) {
    const token0 = await contract.token0();
    const token0_contract = await ethers.getContractAt(IERC20.abi, token0, owner);
    const token0_name = await token0_contract.name();
    const token0_decimal = await token0_contract.decimals();

    const token1 = await contract.token1();
    const token1_contract = await ethers.getContractAt(IERC20.abi, token1, owner);
    const token1_name = await token1_contract.name();
    const token1_decimal = await token1_contract.decimals();

    const reserves = await contract.getReserves();
    const token0_rev = reserves[0];
    const token1_rev = reserves[1];

    const token0_normalize = (token0_rev / (10 ** token0_decimal));
    const token1_normalize = (token1_rev / (10 ** token1_decimal));

    const swap = token0_name + "/" + token1_name;

    return `${token0_name}\naddress: ${token0}\ndecimal: ${token0_decimal}` +
        `\nreserves: ${token0_rev}\nnormalize: ${token0_normalize}` +
        `${token1_name}:\naddress: ${token1}\ndecimal: ${token1_decimal}` +
        `\nreserves: ${token1_rev}\nnormalize: ${token1_normalize}` +
        `\nuniswap contract ${swap} address: ${contract.address}\nratio: ${(token0_rev/token1_rev)}`;
}
