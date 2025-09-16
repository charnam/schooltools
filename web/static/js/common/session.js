let session = null;
async function getSession() {
    if(!session)
        session = (await api("accounts/session")).session;
    return session;
}

export default getSession;