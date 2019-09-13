import * as _ from 'lodash-es';
import * as React from 'react';

import { createModalLauncher, ModalTitle, ModalBody, ModalSubmitFooter } from '../factory/modal';
import { PromiseComponent, history, resourceListPathFromModel } from '../utils';
import { k8sKill } from '../../module/k8s/';
import { YellowExclamationTriangleIcon } from '@console/shared';
import { TextInput } from '@patternfly/react-core';

class ConfirmDeleteModal extends PromiseComponent {
  constructor(props) {
    super(props);
    this._submit = this._submit.bind(this);
    this._cancel = this.props.cancel.bind(this);
    this.state = Object.assign(this.state, {
      inputField:'',
      inputMatch:false,
    });
    this.checkInputMatch = this.checkInputMatch.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  checkInputMatch(){
   if (this.state.inputField == this.props.resource.metadata.name) {
     return true;
   }
   else return false;
  }

  _submit(event) {
    event.preventDefault();
    const {kind, resource} = this.props;
    this.handlePromise( k8sKill(kind, resource, {})).then(() => {
      this.props.close();
    });
  }

  handleInputChange(val) {
    this.setState({inputField:val});
  }

  render() {
    const {kind, resource} = this.props;
    return <form onSubmit={this._submit} name="form" className="modal-content ">
      <ModalTitle>Delete {kind.label}</ModalTitle>
      <ModalBody className="modal-body">
        <div className="co-delete-modal">
        <div>
            <p className="lead">
              <YellowExclamationTriangleIcon className="co-delete-modal__icon" />
              Delete <span className="co-break-word">Object Bucket Claim</span>
            </p>
            <div>
            <div>
            The action will permanently delete <strong className="co-break-word">{resource.metadata.name}</strong>
            </div>
            <div>
            <strong className="co-break-word">This cannot be undone.</strong>
            </div>
            <br />
            <div>
              Type <strong className="co-break-word">{resource.metadata.name}</strong> to confirm
              <TextInput type="text" aria-label={`Type ${resource.metadata.name} here` } placeholder="Enter name" onChange={val=>this.handleInputChange(val)} />
            </div>
              </div>
              </div>
        </div>
      </ModalBody>
      <ModalSubmitFooter submitDisabled={this.state.inputMatch}  errorMessage={this.state.errorMessage} inProgress={this.state.inProgress} submitDanger submitText={this.props.btnText || 'Delete'} cancel={this._cancel} />
    </form>;
  }
}

export const confirmDeleteModal = createModalLauncher(ConfirmDeleteModal);
