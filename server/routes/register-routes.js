const app = require("../app.js");
const { getSessionByRequest } = require("../common/getsession.js");
const { session_required, error } = require("../common/states.js");

function register(routes) {
    
    for(let [route, details] of Object.entries(routes)) {
        
        let func = details.func;
        
        if(!func) { // route is container - nest children
            
            // update paths to start with parent name
            let routeEntries = Object.entries(details);
            let mappedRoutes = routeEntries.map(([childRoute, details]) => ([route+"/"+childRoute, details]));
            let routes = Object.fromEntries(mappedRoutes);
           
            register(routes);
            
            continue;
        }
        
        let requirements = details.requirements;
        
        if(!requirements)
            throw new Error("Invalid route declaration");
        
        app.post(route, async (req,res) => {
            
            let body = req.body;
            const session = await getSessionByRequest(req);
            if(details.require_session && !session)
                return res.json(session_required());
            
            
            function validateLevel(requirementLevel, bodyLevel) {
                
                if(typeof requirementLevel !== "object" || typeof bodyLevel !== "object")
                    return "Invalid structure.";
                
                let entries = Object.entries(requirementLevel);
                
                for(let [key, requiredType] of entries) {
                    let bodyValue = bodyLevel[key];
                    
                    if(typeof requiredType == "object") {
                        let validation = validateLevel(requiredType, bodyValue);
                        if(validation !== true) return validation;
                        continue;
                    }
                    if(typeof requiredType == "function") {
                        let validation = requiredType(bodyValue);
                        if(validation && validation.type == "error") return validation.message;
                        else if(validation && validation.type == "success") continue;
                        else return "Internal error while checking valud of "+key
                    }
                    
                    let valueType = typeof bodyValue;
                    if(Array.isArray(bodyValue))
                        valueType = "array"; // for now, let's agree to not use arrays if we can't verify their contents
                    
                    if(requiredType !== valueType)
                        return `API error: ${key} was type ${valueType} instead of type ${requiredType}`
                    
                }
                
                return true;
            }
            
            let validation = validateLevel(requirements, body);
            
            if(validation === true) {
                let output = await func(body, session, req, res);
                res.json(output);
            } else {
                res.json(error(validation));
            }
            
        })
    }
    
}

module.exports = (routes) => register({"/api": routes});
