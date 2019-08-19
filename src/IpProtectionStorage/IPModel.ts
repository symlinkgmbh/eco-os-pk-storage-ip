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



import { MsIpProtection } from "@symlinkde/eco-os-pk-models";

export class IPModel implements MsIpProtection.IIPModel {
  public address: string;
  public deny: boolean;
  public createdAt?: Date;
  public _id?: string;

  constructor(ip: MsIpProtection.IIPModel) {
    this.address = ip.address;
    this.createdAt = ip.createdAt;
    this.deny = ip.deny;
    this._id = ip._id;
  }

  public getAddress(): string {
    return this.address;
  }

  public setAddress(ip: string): void {
    this.address = ip;
    return;
  }

  public getCreatedAt(): Date {
    return this.createdAt === undefined ? new Date() : this.createdAt;
  }

  public setCreateAt(date: Date): void {
    this.createdAt = date;
    return;
  }

  public getDeny(): boolean {
    return this.deny;
  }

  public setDeny(deny: boolean): void {
    this.deny = deny;
    return;
  }

  public getId(): string {
    return this._id === undefined ? "" : this._id;
  }

  public setId(_id: string): void {
    this._id = _id;
  }
}
