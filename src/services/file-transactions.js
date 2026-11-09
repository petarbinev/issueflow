// Network failures can arrive after a write committed. Check its record before
// deleting a stored object or asking the user to repeat a completed operation.
export async function saveFile({ uploadObject, saveRecord, findRecord, removeObject }) {
  try {
    await uploadObject();
    await saveRecord();
  } catch (error) {
    let recorded;
    try { recorded = await findRecord(); }
    catch { throw new Error('The upload could not be confirmed. Refresh attachments before trying again.', { cause: error }); }
    if (recorded) return;
    try { await removeObject(); }
    catch { throw new Error('The upload failed and cleanup could not finish. Contact an administrator before uploading again.', { cause: error }); }
    throw error;
  }
}

export async function deleteFile({ removeObject, removeRecord, recordExists }) {
  await removeObject();
  let error;
  try { if ((await removeRecord()).length) return; }
  catch (failure) { error = failure; }
  try { if (!await recordExists()) return; }
  catch { throw new Error('Removal could not be confirmed. Refresh attachments before trying again.', { cause: error }); }
  if (error) throw new Error('The file was removed but its listing could not be updated. Retry Delete to finish.', { cause: error });
  throw new Error('You do not have permission to delete this attachment.');
}
