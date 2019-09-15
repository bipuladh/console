import * as React from 'react';

import { createModalLauncher, ModalTitle, ModalBody, ModalSubmitFooter } from '../factory/modal';
import { PromiseComponent, history, Dropdown, resourceObjPath } from '../utils';
import { k8sList, k8sPatch, referenceFor } from '../../module/k8s/';
import { PodModel } from '../../models/index';

class AttachPodsToOBCModal extends PromiseComponent {
  constructor(props) {
    super(props);
    this.state = {
      inProgress: false,
      errorMessage: '',
      podNames:{},
      requestPod:'',
    };
    this._cancel = this.props.cancel.bind(this);
    this._submit = this._submit.bind(this);
  }

c
componentDidMount(){
  const namespace = this.props.resource.metadata.namespace;
  const list = {};
  this.handlePromise(k8sList(PodModel,{ns:namespace})).then( (this, data) =>{
    data.map((elem)=>{
      const name = elem.metadata.name;
      list[name] = name;
    });
    this.setState({podNames:list});
  });
}

/*TODO */
_submit(e) {
  e.preventDefault();
  const requestedPod =this.state.requestedPod;
  /**Not sure what to do yet */
  const patch = [{op: 'attach', path: '/spec/resources/requests', value: {pod: `${requestedPod}`}}];
  this.handlePromise(k8sPatch(PodModel, this.props.resource, patch)).then((resource) => {
    this.props.close();
    //Redirect to the obc details page
    history.push(resourceObjPath(resource, referenceFor(resource)));
  })
    .catch( (err) => this.setState({errorMessage:err.message}));
}

render() {
  return <form onSubmit={this._submit} name="form" className="modal-content modal-content--no-inner-scroll">
    <ModalTitle>Attach OBC to a Pod</ModalTitle>
    <ModalBody>
      <label className="control-label co-required">Pod Name</label>
      <Dropdown items={this.state.podNames} dropDownClassName="dropdown--full-width" id="dropdown-selectbox" onChange={pod=>this.setState({requestPod:pod})} />
    </ModalBody>
    <ModalSubmitFooter errorMessage={this.state.errorMessage} inProgress={this.state.inProgress} submitText="Attach" cancel={this._cancel} />
  </form>;
}
}


export const attachPodsToOBCModal = createModalLauncher(AttachPodsToOBCModal);
