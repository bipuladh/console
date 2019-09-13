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
} from '../utils';
import { StorageClassDropdown } from '../utils/storage-class-dropdown';
import { NooBaaObjectBucketModel } from '@console/noobaa-storage-plugin/src/models';

export class CreateOBPage_ extends React.Component {
  state = {
    storageClass: '',
    obName:'',
    obObj:null,
    inProgress: false,
    error: '',

  };

  handleChange: React.ReactEventHandler<HTMLInputElement> = event => {
    const { name, value } = event.currentTarget;
    this.setState({[name]:value} as any, this.onChange);
  };

  handleStorageClass = storageClass => {
    this.setState({ storageClass:_.get(storageClass,'metadata.name')}, this.onChange);
  }

  onChange = () => {
    this.updateOB();
  }

  updateOB = () => {
    const { storageClass, obName} = this.state;
    const obj: K8sResourceKind = {
      apiVersion: 'objectbucket.io/v1alpha1',
      kind: 'ObjectBucket',
      metadata: {
        name: obName,
      },
      spec:{}
    };
    if (storageClass) {
      obj.spec.storageClassName = storageClass;
    }
    this.setState({obObj:obj});
    return obj;
  };

  save = (e: React.FormEvent<EventTarget>) => {
    e.preventDefault();
    this.setState({ inProgress: true });
    k8sCreate(NooBaaObjectBucketModel, this.state.obObj).then(
      resource => {
        this.setState({ inProgress: false });
        history.push(resourceObjPath(resource, referenceFor(resource)));
      },
      err =>{
        this.setState({error: err.message, inProgress: false});
      } 
    );
  };

  render(){
    const { error, inProgress } = this.state;
    return (
      <div className="co-m-pane__body co-m-pane__form">
        <Helmet>
          <title>Create Object Bucket</title>
        </Helmet>
        <h1 className="co-m-pane__heading co-m-pane__heading--baseline">
          <div className="co-m-pane__name">
            Create Object Bucket
          </div>
          <div className="co-m-pane__heading-link">
            <Link to={`/k8s/cluster/objectbuckets/~new`} id="yaml-link" replace>Edit YAML</Link>
          </div>
        </h1>
        <form className="co-m-pane__body-group" onSubmit={this.save}>
            <div>
              <div className="form-group">
              <label className="control-label co-required" htmlFor="ob-name">
                Object Bucket Name
              </label>
              <div className="form-group">
                <input
                  className="pf-c-form-control"
                  type="text"
                  onChange={this.handleChange}
                  placeholder="my-object-bucket"
                  aria-describedby="ob-name-help"
                  id="ob-name"
                  name="obName"
                  pattern="[a-z0-9](?:[-a-z0-9]*[a-z0-9])?"
                  required
                />
                <p className="help-block" id="ob-name-help">
                  If not provided, a generic name will be generated.
                </p>
              </div>
              <div className="form-group">
                <StorageClassDropdown
                  onChange={this.handleStorageClass}
                  id="storageclass-dropdown"
                  describedBy="hide_storage_class_default_help"
                  required={true}
                  name="storageClass"

                />
                <p className="help-block" id="ob-name-help">
                  Defines the object-store service and the bucket provisioner.
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
}


export const CreateOBPage = () => { return <CreateOBPage_ /> };