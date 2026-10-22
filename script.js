let prompt=document.querySelector("#prompt")
let submitbtn=document.querySelector("#submit")
let chatContainer=document.querySelector(".chat-container")
let imagebtn=document.querySelector("#image")
let imageinput=document.querySelector("#image input")

const Api_Url = "/.netlify/functions/chat"; 
let user={
    message:null,
    file:{
        mime_type: null,
            data: null
}
}


async function generateResponse(aiChatBox) {
    const text = aiChatBox.querySelector(".ai-chat-area");

    const parts = [{ text: user.message }];

    if (user.file?.data && user.file?.mime_type) {
        parts.push({
            inline_data: {
                mime_type: user.file.mime_type,
                data: user.file.data
            }
        });
    }

    try {
        const response = await fetch(Api_Url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ parts })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Request failed");
        }

        text.textContent = data.text ||
            "Sorry, I couldn't generate a response.";

    } catch (error) {
        console.error("Chatbot error:", error);
        text.textContent =
            "Sorry, something went wrong. Please try again.";
    } finally {
        chatContainer.scrollTo({
            top: chatContainer.scrollHeight,
            behavior: "smooth"
        });

        user.file = {
            mime_type: null,
            data: null
        };
    }
}


function createChatBox(html,classes){
    let div=document.createElement("div")
    div.innerHTML=html
    div.classList.add(classes)
    return div
}

function handlechatResponse(message){
    user.message=message
    let html=`<img src="user.png" alt="" id="userImage" width="10%">
    </div>
    <div class="user-chat-area">
        ${user.message}
        ${user.file.data?`<img src="data:${user.file.mime_type};base64,${user.file.data}" class="chooseimg" />`:""}
    </div>`
    prompt.value=""
    let userChatBox=createChatBox(html,"user-chat-box")    //returns div aur hamne us div ko userChatBox ke andar likh liya
    chatContainer.appendChild(userChatBox) 

    chatContainer.scrollTo({top:chatContainer.scrollHeight,behavior:"smooth"})
    
    setTimeout(()=>{
        let html=`<img src="ai.png" alt="" id="aiImage" width="10%" > 
        <div class="ai-chat-area">
        <p id="load">loading..</p>
        </div>`
        let aiChatBox=createChatBox(html,"ai-chat-box")
        chatContainer.appendChild(aiChatBox)
        generateResponse(aiChatBox)
    },600)
}
prompt.addEventListener("keydown",(e)=>{
    if(e.key=="Enter"){
        handlechatResponse(prompt.value)
    }
    
})

submitbtn.addEventListener("click",()=>{
        handlechatResponse(prompt.value)
    
})
imageinput.addEventListener("change",()=>{
    const file=imageinput.files[0]
    if(!file) return
    let reader=new FileReader()
    reader.onload=(e)=>{
        let base64string=e.target.result.split(",")[1]
        user.file={
            mime_type:file.type,
            data:base64string
        }
    }
    reader.readAsDataURL(file)
})
imagebtn.addEventListener("click",()=>{
    imagebtn.querySelector("input").click()
})