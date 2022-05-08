// @TODO add fulfillLimitOrder
import { assert } from 'ts-essentials';
import type { ExtractAbiMethodNames } from '../../helpers/misc';
import type {
  Address,
  ConstructProviderFetchInput,
  TxSendOverrides,
} from '../../types';
import type { OrderData } from './buildOrder';
import { chainId2verifyingContract, sanitizeOrderData } from './helpers/misc';

export interface FillOrderInput {
  orderData: OrderData;
  signature: string;
}

type FillOrder<T> = (
  params: FillOrderInput,
  overrides?: TxSendOverrides
) => Promise<T>;

export interface PartialFillOrderInput extends FillOrderInput {
  fillAmount: string;
}

type PartialFillOrder<T> = (
  params: PartialFillOrderInput,
  overrides?: TxSendOverrides
) => Promise<T>;

export interface PartialFillOrderWithTargetPermitInput
  extends PartialFillOrderInput {
  /** @description address to send tokens to. Pass current account */
  target: Address;
  /** @description for permissible taker's Token, '0x' by default === no permit used */
  permitTakerAsset?: string;
  /** @description for permissible maker's Token, '0x' by default === no permit used */
  permitMakerAsset?: string;
}

type PartialFillOrderWithTargetPermit<T> = (
  params: PartialFillOrderWithTargetPermitInput,
  overrides?: TxSendOverrides
) => Promise<T>;

export type FillLimitOrderFunctions<T> = {
  fillLimitOrder: FillOrder<T>;
  partialFilllLimitOrder: PartialFillOrder<T>;
  partialFillLimitOrderWithTargetPermit: PartialFillOrderWithTargetPermit<T>;
};

// much smaller than the whole ERC20_ABI
const MinAugustusRFQAbi = [
  {
    inputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'nonceAndMeta',
            type: 'uint256',
          },
          {
            internalType: 'uint128',
            name: 'expiry',
            type: 'uint128',
          },
          {
            internalType: 'address',
            name: 'makerAsset',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'takerAsset',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'maker',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'taker',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'makerAmount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'takerAmount',
            type: 'uint256',
          },
        ],
        internalType: 'struct AugustusRFQ.Order',
        name: 'order',
        type: 'tuple',
      },
      {
        internalType: 'bytes',
        name: 'signature',
        type: 'bytes',
      },
    ],
    name: 'fillOrder',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'nonceAndMeta',
            type: 'uint256',
          },
          {
            internalType: 'uint128',
            name: 'expiry',
            type: 'uint128',
          },
          {
            internalType: 'address',
            name: 'makerAsset',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'takerAsset',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'maker',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'taker',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'makerAmount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'takerAmount',
            type: 'uint256',
          },
        ],
        internalType: 'struct AugustusRFQ.Order',
        name: 'order',
        type: 'tuple',
      },
      {
        internalType: 'bytes',
        name: 'signature',
        type: 'bytes',
      },
      {
        internalType: 'uint256',
        name: 'takerTokenFillAmount',
        type: 'uint256',
      },
    ],
    name: 'partialFillOrder',
    outputs: [
      {
        internalType: 'uint256',
        name: 'makerTokenFilledAmount',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'nonceAndMeta',
            type: 'uint256',
          },
          {
            internalType: 'uint128',
            name: 'expiry',
            type: 'uint128',
          },
          {
            internalType: 'address',
            name: 'makerAsset',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'takerAsset',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'maker',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'taker',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'makerAmount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'takerAmount',
            type: 'uint256',
          },
        ],
        internalType: 'struct AugustusRFQ.Order',
        name: 'order',
        type: 'tuple',
      },
      {
        internalType: 'bytes',
        name: 'signature',
        type: 'bytes',
      },
      {
        internalType: 'uint256',
        name: 'takerTokenFillAmount',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'target',
        type: 'address',
      },
      {
        internalType: 'bytes',
        name: 'permitTakerAsset',
        type: 'bytes',
      },
      {
        internalType: 'bytes',
        name: 'permitMakerAsset',
        type: 'bytes',
      },
    ],
    name: 'partialFillOrderWithTargetPermit',
    outputs: [
      {
        internalType: 'uint256',
        name: 'makerTokenFilledAmount',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

type AvailableMethods = ExtractAbiMethodNames<typeof MinAugustusRFQAbi>;

// returns whatever `contractCaller` returns
// to allow for better versatility
export const constructFillLimitOrder = <T>(
  options: ConstructProviderFetchInput<T, 'transactCall'>
): FillLimitOrderFunctions<T> => {
  const verifyingContract = chainId2verifyingContract[options.network];

  // @TODO add fillOrderWithTarget variants and bulk* variants

  const fillLimitOrder: FillOrder<T> = async (
    { orderData, signature },
    overrides = {}
  ) => {
    assert(
      verifyingContract,
      `AugustusRFQ contract for Limit Orders not available on chain ${options.network}`
    );

    const res = await options.contractCaller.transactCall<AvailableMethods>({
      address: verifyingContract,
      abi: MinAugustusRFQAbi,
      contractMethod: 'fillOrder',
      // types allow to pass OrderData & extra_stuff, but tx will break like that
      args: [sanitizeOrderData(orderData), signature],
      overrides,
    });

    return res;
  };

  const partialFilllLimitOrder: PartialFillOrder<T> = async (
    { orderData, signature, fillAmount },
    overrides = {}
  ) => {
    assert(
      verifyingContract,
      `AugustusRFQ contract for Limit Orders not available on chain ${options.network}`
    );

    const res = await options.contractCaller.transactCall<AvailableMethods>({
      address: verifyingContract,
      abi: MinAugustusRFQAbi,
      contractMethod: 'partialFillOrder',
      // types allow to pass OrderData & extra_stuff, but tx will break like that
      args: [sanitizeOrderData(orderData), signature, fillAmount],
      overrides,
    });

    return res;
  };

  const partialFillLimitOrderWithTargetPermit: PartialFillOrderWithTargetPermit<
    T
  > = async (
    {
      orderData,
      signature,
      fillAmount,
      target,
      permitTakerAsset = '0x',
      permitMakerAsset = '0x',
    },
    overrides = {}
  ) => {
    assert(
      verifyingContract,
      `AugustusRFQ contract for Limit Orders not available on chain ${options.network}`
    );

    const res = await options.contractCaller.transactCall<AvailableMethods>({
      address: verifyingContract,
      abi: MinAugustusRFQAbi,
      contractMethod: 'partialFillOrderWithTargetPermit',
      args: [
        // types allow to pass OrderData & extra_stuff, but tx will break like that
        sanitizeOrderData(orderData),
        signature,
        fillAmount,
        target,
        permitTakerAsset,
        permitMakerAsset,
      ],
      overrides,
    });

    return res;
  };

  return {
    fillLimitOrder,
    partialFilllLimitOrder,
    partialFillLimitOrderWithTargetPermit,
  };
};
