import { Fixture } from 'ethereum-waffle';
import { ethers, waffle } from 'hardhat';

import { Wallet } from '@ethersproject/wallet';

import { Registry__factory } from '../typechain';
import { RollupChain__factory } from '../typechain/factories/RollupChain__factory';
import { StrategyDummy__factory } from '../typechain/factories/StrategyDummy__factory';
import { TestERC20__factory } from '../typechain/factories/TestERC20__factory';
import { TransitionEvaluator__factory } from '../typechain/factories/TransitionEvaluator__factory';

// Workaround for https://github.com/nomiclabs/hardhat/issues/849
// TODO: Remove once fixed upstream.
export function loadFixture<T>(fixture: Fixture<T>) {
  const provider = waffle.provider;
  return waffle.createFixtureLoader(provider.getWallets(), provider)(fixture);
}

export async function deployContracts(admin: Wallet) {
  const registryFactory = (await ethers.getContractFactory(
    'Registry'
  )) as Registry__factory;
  const registry = await registryFactory.deploy();
  await registry.deployed();

  const transitionEvaluatorFactory = (await ethers.getContractFactory(
    'TransitionEvaluator'
  )) as TransitionEvaluator__factory;
  const transitionEvaluator = await transitionEvaluatorFactory.deploy(
    registry.address
  );
  await transitionEvaluator.deployed();

  const rollupChainFactory = (await ethers.getContractFactory(
    'RollupChain'
  )) as RollupChain__factory;
  const rollupChain = await rollupChainFactory.deploy(
    0,
    0,
    transitionEvaluator.address,
    registry.address,
    admin.address
  );
  await rollupChain.deployed();

  const testERC20Factory = (await ethers.getContractFactory(
    'TestERC20'
  )) as TestERC20__factory;
  const testERC20 = await testERC20Factory.deploy();
  await testERC20.deployed();

  const strategyDummyFactory = (await ethers.getContractFactory(
    'StrategyDummy'
  )) as StrategyDummy__factory;
  const strategyDummy = await strategyDummyFactory.deploy(
    rollupChain.address,
    admin.address,
    testERC20.address
  );
  await strategyDummy.deployed();
  return { admin, registry, rollupChain, strategyDummy, testERC20 };
}
