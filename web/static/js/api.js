
async function reachEndpoint(path, body) {
    if(body instanceof FormData)
        body = Object.fromEntries( // not recommended. probably won't use this in practice - backend expects JSON
            Array.from(body.keys()).map(key => [
                key, body.getAll(key).length > 1 ? 
                body.getAll(key) : body.get(key)
            ])
        );
    
    
    return await fetch("/api/"+path, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    }).then(req => req.json());
}

export default reachEndpoint;