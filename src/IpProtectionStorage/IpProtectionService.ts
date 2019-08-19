/**
 * Copyright 2018-2019 Symlink GmbH
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 */



import { STORAGE_TYPES, storageContainer } from "@symlinkde/eco-os-pk-storage";
import { bootstrapperContainer } from "@symlinkde/eco-os-pk-core";
import Config from "config";
import { injectable } from "inversify";
import { IPModel } from "./IPModel";
import { PkStorageIpProtection, PkStorage, MsIpProtection } from "@symlinkde/eco-os-pk-models";

@injectable()
export class IpProtectionService implements PkStorageIpProtection.IIpProtectionService {
  private repro: PkStorage.IMongoRepository<IPModel>;

  public constructor() {
    storageContainer.bind(STORAGE_TYPES.Collection).toConstantValue(Config.get("mongo.collection"));
    storageContainer.bind(STORAGE_TYPES.Database).toConstantValue(Config.get("mongo.db"));
    storageContainer.bind(STORAGE_TYPES.StorageTarget).toConstantValue("SECONDLOCK_MONGO_IP_PROTECTION_DATA");
    storageContainer
      .bind(STORAGE_TYPES.SECONDLOCK_REGISTRY_URI)
      .toConstantValue(bootstrapperContainer.get("SECONDLOCK_REGISTRY_URI"));
    this.repro = storageContainer.getTagged<PkStorage.IMongoRepository<IPModel>>(
      STORAGE_TYPES.IMongoRepository,
      STORAGE_TYPES.STATE_LESS,
      false,
    );
  }

  public async add(obj: MsIpProtection.IIPModel): Promise<MsIpProtection.IIPModel> {
    const blacklistInstance: IPModel = new IPModel(obj);
    blacklistInstance.createdAt = new Date();
    const objectId = await this.repro.create(blacklistInstance);
    blacklistInstance.setId(objectId);
    return blacklistInstance;
  }

  public async getAllEntries(): Promise<Array<MsIpProtection.IIPModel> | null> {
    const result = await this.repro.find({});

    if (result === null) {
      return result;
    }

    return result.map((entry) => new IPModel(entry));
  }

  public async getAllWhitelistEntries(): Promise<Array<MsIpProtection.IIPModel> | null> {
    const result = await this.repro.find({ deny: false });

    if (result === null) {
      return result;
    }

    return result.map((entry) => new IPModel(entry));
  }

  public async getAllBlacklistEntries(): Promise<Array<MsIpProtection.IIPModel> | null> {
    const result = await this.repro.find({ deny: true });

    if (result === null) {
      return result;
    }

    return result.map((entry) => new IPModel(entry));
  }

  public async getEntryById(id: string): Promise<MsIpProtection.IIPModel | null> {
    const result = await this.repro.findOne(id);
    if (result === null) {
      return result;
    }

    return new IPModel(<MsIpProtection.IIPModel>result);
  }

  public async getEntryByIp(address: string): Promise<MsIpProtection.IIPModel | null> {
    const result = await this.repro.find({ address });
    if (result === null) {
      return result;
    }

    return result.map((entry) => new IPModel(entry))[0];
  }

  public async updateEntryById(address: string, obj: MsIpProtection.IIPModel): Promise<boolean> {
    return await this.repro.update(address, obj);
  }

  public async deleteEntryById(id: string): Promise<boolean> {
    return await this.repro.delete(id);
  }

  public async deleteBlacklist(): Promise<boolean> {
    return await this.repro.deleteMany({ deny: true });
  }

  public async deleteWhitelist(): Promise<boolean> {
    return await this.repro.deleteMany({ deny: false });
  }

  public async getEntryFromBlacklist(id: string): Promise<MsIpProtection.IIPModel | null> {
    const result = await this.repro.find({ _id: id, deny: true });
    if (result === null) {
      return result;
    }

    return result.map((entry) => new IPModel(entry))[0];
  }

  public async getEntryFromWhitelist(id: string): Promise<MsIpProtection.IIPModel | null> {
    const result = await this.repro.find({ _id: id, deny: false });
    if (result === null) {
      return result;
    }

    return result.map((entry) => new IPModel(entry))[0];
  }

  public async search(address: string): Promise<Array<MsIpProtection.IIPModel> | null> {
    const result = await this.repro.find({ address: { $regex: `.*${address}.*` } });
    if (result === null) {
      return null;
    }

    return result.map((entry) => new IPModel(entry));
  }

  public async getAllCIDRAddresses(deny: boolean): Promise<Array<MsIpProtection.IIPModel> | null> {
    const result = await this.repro.find({ address: { $regex: ".*/." }, deny });
    if (result === null) {
      return null;
    }

    return result.map((entry) => new IPModel(entry));
  }
}
