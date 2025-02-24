import React, { useEffect, useState } from "react";
import { AssetData } from "../AssetTypes";
import { useDispatch } from "react-redux";
import {
  partialUpdateAsset,
  getPermittedFacility,
} from "../../../Redux/actions";
import * as Notification from "../../../Utils/Notifications.js";
import MonitorConfigure from "../configure/MonitorConfigure";
import Loading from "../../Common/Loading";
import { checkIfValidIP } from "../../../Common/validation";
import Card from "../../../CAREUI/display/Card";
import { Submit } from "../../Common/components/ButtonV2";
import CareIcon from "../../../CAREUI/icons/CareIcon";
import TextFormField from "../../Form/FormFields/TextFormField";
import HL7PatientVitalsMonitor from "../../VitalsMonitor/HL7PatientVitalsMonitor";

interface HL7MonitorProps {
  assetId: string;
  facilityId: string;
  asset: any;
}

const HL7Monitor = (props: HL7MonitorProps) => {
  const { assetId, asset, facilityId } = props;
  const [assetType, setAssetType] = useState("");
  const [middlewareHostname, setMiddlewareHostname] = useState("");
  const [facilityMiddlewareHostname, setFacilityMiddlewareHostname] =
    useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [localipAddress, setLocalIPAddress] = useState("");
  const [ipadrdress_error, setIpAddress_error] = useState("");

  const dispatch = useDispatch<any>();

  useEffect(() => {
    const fetchFacility = async () => {
      const res = await dispatch(getPermittedFacility(facilityId));

      if (res.status === 200 && res.data) {
        setFacilityMiddlewareHostname(res.data.middleware_address);
      }
    };

    if (facilityId) fetchFacility();
  }, [dispatch, facilityId]);

  useEffect(() => {
    setAssetType(asset?.asset_class);
    setMiddlewareHostname(asset?.meta?.middleware_hostname);
    setLocalIPAddress(asset?.meta?.local_ip_address);
    setIsLoading(false);
  }, [asset]);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (checkIfValidIP(localipAddress)) {
      setIpAddress_error("");
      const data = {
        meta: {
          asset_type: assetType,
          middleware_hostname: middlewareHostname, // TODO: remove this infavour of facility.middleware_address
          local_ip_address: localipAddress,
        },
      };
      const res: any = await Promise.resolve(
        dispatch(partialUpdateAsset(assetId, data))
      );
      if (res?.status === 200) {
        Notification.Success({
          msg: "Asset Configured Successfully",
        });
      } else {
        Notification.Error({
          msg: "Something went wrong..!",
        });
      }
    } else {
      setIpAddress_error("Please Enter a Valid IP address !!");
    }
  };

  const middleware = middlewareHostname || facilityMiddlewareHostname;

  if (isLoading) return <Loading />;
  return (
    <div className="flex w-full mx-auto xl:mt-8">
      <div className="flex flex-col xl:flex-row-reverse gap-4 mx-auto">
        <div className="w-full xl:max-w-xs shrink-0 flex flex-col gap-4">
          <Card className="w-full flex flex-col">
            <form onSubmit={handleSubmit}>
              <h2 className="text-lg font-bold mb-2">Connection</h2>
              <div className="flex flex-col">
                <TextFormField
                  name="middlewareHostname"
                  label="Middleware Hostname"
                  placeholder={facilityMiddlewareHostname}
                  value={middlewareHostname}
                  onChange={(e) => setMiddlewareHostname(e.value)}
                  errorClassName="hidden"
                />
                <TextFormField
                  name="localipAddress"
                  label="Local IP Address"
                  value={localipAddress}
                  onChange={(e) => setLocalIPAddress(e.value)}
                  required
                  error={ipadrdress_error}
                />
                <Submit className="w-full">
                  <CareIcon className="care-l-save" />
                  <span>Save Configuration</span>
                </Submit>
              </div>
            </form>
          </Card>
          <Card>
            {assetType === "HL7MONITOR" && (
              <MonitorConfigure asset={asset as AssetData} />
            )}
          </Card>
        </div>

        <HL7PatientVitalsMonitor
          socketUrl={`wss://${middleware}/observations/${localipAddress}`}
        />
      </div>
    </div>
  );
};
export default HL7Monitor;
