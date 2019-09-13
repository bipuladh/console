import * as _ from 'lodash-es';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { ActionGroup, Button } from '@patternfly/react-core';

import { k8sCreate, K8sResourceKind, referenceFor } from '../../module/k8s';
import {
  ButtonBar,
  history,
  resourceObjPath,
  RequestSizeInput,
} from '../utils';
import { StorageClassDropdown } from '../utils/storage-class-dropdown';
import { NooBaaObjectBucketClaimModel } from '@console/noobaa-storage-plugin/src/models';

/**Add type based on the supplier*/
export const CreateOBCPage:React.FC = (props) =>{
  const [obcName, setObcName ] = React.useState('');
  const [storageClass, setStorageClass ] = React.useState((''));
  const [error, setError] = React.useState('');
  const [inProgress,setProgress ] = React.useState(false);
  const [obcObj, setObcObj] = React.useState({});
  const [requestUnit, setRequestUnit] = React.useState('MiB');
  const [requestSizeValue, setRequestSizeValue] = React.useState('');

  const namespace = _.get(props,'match.params.ns');
  const dropDownUnits = {
  MiB:'MiB',
  GiB:'GiB',
  TiB:'TiB'
  }

  const handleChange: React.ReactEventHandler<HTMLInputElement> = event => {
    // this handles pvcName, accessMode, size
    const { name, value } = event.currentTarget;
    if (name == 'obcName'){
      setObcName(value);
    }
  };

  /**To update values whenever we change anything. Also fixes the rerendering for storageClass*/
  React.useEffect(()=>{
    onChange();
  },[storageClass, obcName, requestSizeValue, requestUnit]);

  const onChange = ()=> {
    setObcObj(updateObc());
  };

  const handleStorageClass = storageClass => {
    const scName = _.get(storageClass, 'metadata.name');
    setStorageClass(scName);
  };

  const save = (e: React.FormEvent<EventTarget>) => {
    e.preventDefault();
    setProgress(true);
    k8sCreate(NooBaaObjectBucketClaimModel , obcObj).then(
      resource => {
        setProgress(false);
        history.push(resourceObjPath(resource, referenceFor(resource)));
      },
      err =>{
        setError(err);
        setProgress(false);
      } 
    );
  };

  const handleRequestSizeInputChange = obj => {
    setRequestUnit(obj.unit);
    setRequestSizeValue(obj.value);
  }

  const updateObc = () => {
    const obj: K8sResourceKind = {
      apiVersion: 'objectbucket.io/v1alpha1',
      kind: 'ObjectBucketClaim',
      metadata: {
        name: obcName,
        namespace:namespace,
      },
      spec:{}
    }
    if (storageClass) {
      obj.spec.storageClassName = storageClass;
    }
    return obj;
  };

    return (
      <div className="co-m-pane__body co-m-pane__form">
        <Helmet>
          <title>Create Object Bucket Claim</title>
        </Helmet>
        <h1 className="co-m-pane__heading co-m-pane__heading--baseline">
          <div className="co-m-pane__name">
            Create Object Bucket Claim
          </div>
          <div className="co-m-pane__heading-link">
            <Link to={`/k8s/ns/${namespace}/objectbucketclaims/~new`} id="yaml-link" replace>Edit YAML</Link>
          </div>
        </h1>
        <form className="co-m-pane__body-group" onSubmit={save}>
            <div>
              <div className="form-group">
              <label className="control-label co-required" htmlFor="obc-name">
                Object Bucket Claim Name
              </label>
              <div className="form-group">
                <input
                  className="pf-c-form-control"
                  type="text"
                  onChange={handleChange}
                  placeholder="my-obcject-bucket"
                  aria-describedby="obc-name-help"
                  id="obc-name"
                  name="obcName"
                  pattern="[a-z0-9](?:[-a-z0-9]*[a-z0-9])?"
                  required
                />
                <p className="help-block" id="obc-name-help">
                  If not provided, a generic name will be generated.
                </p>
              </div>
              <div className="form-group">
                <StorageClassDropdown
                  onChange={handleStorageClass}
                  id="storageclass-dropdown"
                  describedBy="hide_storage_class_default_help"
                  required={true}
                  name="storageClass"
                />
                <p className="help-block" id="storageclass-dropdown-help">
                  Defines the object-store service and the bucket provisioner.
                </p>
              </div>
              <div className="form-group">
                <label className="control-label co-required" htmlFor="request-size-input">
                  Size
                </label>
                <RequestSizeInput
                    name="requestSize"
                  required={false}
                  onChange={handleRequestSizeInputChange}
                  defaultRequestSizeUnit={requestUnit}
                  defaultRequestSizeValue={requestSizeValue}
                  dropdownUnits={dropDownUnits}
                  describedBy="request-size-help"
                />
                <p className="help-block" id="request-size-help">
                  Will apply for MCG Buckets only
                </p>
              </div>
            </div>
            </div>
          <ButtonBar errorMessage={error} inProgress={inProgress}>
            <ActionGroup className="pf-c-form">
              <Button
                id="save-changes"
                type="submit"
                variant="primary">
                Create
              </Button>
              <Button
                onClick={history.goBack}
                type="button"
                variant="secondary">
                Cancel
              </Button>
            </ActionGroup>
          </ButtonBar>
        </form>
      </div>

    );
  }