import test from 'node:test';
import assert from 'node:assert/strict';
import { saveFile,deleteFile } from '../src/services/file-transactions.js';

function fixture() {
  const state={object:false,record:false};
  return {state,upload:{
    uploadObject:async()=>{state.object=true;},
    saveRecord:async()=>{state.record=true;},
    findRecord:async()=>state.record,
    removeObject:async()=>{state.object=false;},
  },remove:{
    removeObject:async()=>{state.object=false;},
    removeRecord:async()=>{const existed=state.record;state.record=false;return existed?['file']:[];},
    recordExists:async()=>state.record,
  }};
}

test('failed metadata write rolls back storage and a later upload succeeds once',async()=>{
  const {state,upload}=fixture();
  await assert.rejects(saveFile({...upload,saveRecord:async()=>{throw new Error('Write rejected');}}),/Write rejected/);
  assert.deepEqual(state,{object:false,record:false});
  await saveFile(upload);
  assert.deepEqual(state,{object:true,record:true});
});

test('a committed upload with a lost metadata response keeps the downloadable object',async()=>{
  const {state,upload}=fixture();
  await saveFile({...upload,saveRecord:async()=>{state.record=true;throw new Error('Response lost');}});
  assert.deepEqual(state,{object:true,record:true});
});

test('a lost upload response is cleaned up when no metadata was saved',async()=>{
  const {state,upload}=fixture();
  await assert.rejects(saveFile({...upload,uploadObject:async()=>{state.object=true;throw new Error('Connection interrupted');}}),/Connection interrupted/);
  assert.deepEqual(state,{object:false,record:false});
});

test('an uncertain metadata outcome never deletes a possibly committed file',async()=>{
  const {state,upload}=fixture();
  await assert.rejects(saveFile({...upload,saveRecord:async()=>{state.record=true;throw new Error('Response lost');},findRecord:async()=>{throw new Error('Offline');}}),/could not be confirmed/);
  assert.deepEqual(state,{object:true,record:true});
});

test('metadata deletion can be retried after storage was already removed',async()=>{
  const {state,remove}=fixture();state.object=true;state.record=true;
  await assert.rejects(deleteFile({...remove,removeRecord:async()=>{throw new Error('Temporary write failure');}}),/Retry Delete/);
  assert.deepEqual(state,{object:false,record:true});
  await deleteFile(remove);
  await deleteFile(remove);
  assert.deepEqual(state,{object:false,record:false});
});

test('a lost delete response is treated as success when the record is gone',async()=>{
  const {state,remove}=fixture();state.object=true;state.record=true;
  await deleteFile({...remove,removeRecord:async()=>{state.record=false;throw new Error('Response lost');}});
  assert.deepEqual(state,{object:false,record:false});
});

test('a denied delete cannot be reported as successful while its record remains',async()=>{
  const {state,remove}=fixture();state.object=true;state.record=true;
  await assert.rejects(deleteFile({...remove,removeObject:async()=>{},removeRecord:async()=>[]}),/permission/);
  assert.deepEqual(state,{object:true,record:true});
});
