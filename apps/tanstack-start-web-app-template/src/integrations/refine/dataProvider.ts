import type {
  DataProvider,
  BaseRecord,
  GetListParams,
  GetListResponse,
  GetOneParams,
  GetOneResponse,
  CreateParams,
  CreateResponse,
  UpdateParams,
  UpdateResponse,
  DeleteOneParams,
  DeleteOneResponse,
} from "@refinedev/core";
import { trpcClient } from "@/integrations/trpc/client";

export const ResourceName = {
  health: "health",
} as const;

export type ResourceNameType = (typeof ResourceName)[keyof typeof ResourceName];

export const dataProvider: DataProvider = {
  getList: async <TData extends BaseRecord = BaseRecord>(
    params: GetListParams,
  ): Promise<GetListResponse<TData>> => {
    const { resource } = params;

    switch (resource) {
      case ResourceName.health: {
        const data = await trpcClient.health.check.query();

        return { data: [data] as unknown as TData[], total: 1 };
      }
      default: {
        throw new Error(`getList: unknown resource "${resource}"`);
      }
    }
  },
  getOne: async <TData extends BaseRecord = BaseRecord>(
    params: GetOneParams,
  ): Promise<GetOneResponse<TData>> => {
    const { resource } = params;

    switch (resource) {
      case ResourceName.health: {
        const data = await trpcClient.health.check.query();

        return { data: data as unknown as TData };
      }
      default: {
        throw new Error(`getOne: unknown resource "${resource}"`);
      }
    }
  },
  create: async <TData extends BaseRecord = BaseRecord, TVariables = object>(
    _params: CreateParams<TVariables>,
  ): Promise<CreateResponse<TData>> => {
    throw new Error("create: not implemented");
  },
  update: async <TData extends BaseRecord = BaseRecord, TVariables = object>(
    _params: UpdateParams<TVariables>,
  ): Promise<UpdateResponse<TData>> => {
    throw new Error("update: not implemented");
  },
  deleteOne: async <TData extends BaseRecord = BaseRecord, TVariables = object>(
    _params: DeleteOneParams<TVariables>,
  ): Promise<DeleteOneResponse<TData>> => {
    throw new Error("deleteOne: not implemented");
  },
  getApiUrl: () => "/api",
};
