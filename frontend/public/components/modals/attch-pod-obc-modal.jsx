import * as React from 'react';

import { createModalLauncher, ModalTitle, ModalBody, ModalSubmitFooter } from '../factory/modal';
import { PromiseComponent, RequestSizeInput, resourceObjPath, history, Dropdown } from '../utils';
import { k8sList, k8sPatch, referenceFor } from '../../module/k8s/';
import { PodModel } from '../../models/index';
import { TextInput } from '@patternfly/react-core';

// Modal for expanding persistent volume claims
class AttachPodsToOBCModal extends PromiseComponent {
  constructor(props) {
    super(props);
    this.state = {
      inProgress: false,
      errorMessage: '',
      podName:{He:'He',She:'She'},
    };
    this._cancel = this.props.cancel.bind(this);
    this._submit = this._submit.bind(this);
  }

  componentDidMount(){
    const namespace = this.props.resource.metadata.namespace;
    const list = {};
    this.handlePromise(k8sList(PodModel, {ns:namespace}) ).then( (this, data) =>{
      data.map((elem)=>{
        const name = elem.metadata.name;
        if ( elem.metadata.namespace == namespace ) list[name] = name;
      });
      this.setState({podName:list});
    });
  }

  /*TODO */
  _submit(e) {
    e.preventDefault();
    const requestedPod  =this.state.requestedPod;
    const patch = [{op: 'replace', path: '/spec/resources/requests', value: {pod: `${requestedPod}`}}];
    this.handlePromise(k8sPatch(PodModel, this.props.resource, patch)).then((resource) => {
      this.props.close();
      // redirected to the details page for persitent volume claim
      history.push(resourceObjPath(resource, referenceFor(resource)));
    });
  }

  render() {
    const {kind, resource} = this.props;
    const { requestSizeUnit, requestSizeValue } =this.state;
    return <form onSubmit={this._submit} name="form" className="modal-content modal-content--no-inner-scroll">
      <ModalTitle>Attach OBC to a Pod</ModalTitle>
      <ModalBody>
        <label className="control-label co-required">Pod Name</label>
        <Dropdown items={this.state.podName} dropDownClassName="dropdown--full-width" id="dropdown-selectbox" onChange={pod=>this.setState({requestPod:pod})} />
      </ModalBody>
      <ModalSubmitFooter errorMessage={this.state.errorMessage} inProgress={this.state.inProgress} submitText="Attach" cancel={this._cancel} />
    </form>;
  }
}


export const attachPodsToOBCModal = createModalLauncher(AttachPodsToOBCModal);
