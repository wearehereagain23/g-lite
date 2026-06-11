/**
 * Global Chat Controller Engine (chat.js)
 * Manages live conversational state transitions and message pipeline loops with backend sync.
 */
document.addEventListener('DOMContentLoaded', () => {

    const drawer = document.getElementById('secure-chat-drawer');
    const closeBtn = document.getElementById('close-chat-drawer');
    const triggerBtn = document.getElementById('chat-center-trigger');

    if (!drawer) {
        console.error("Chat engine layout target node framework element was not detected.");
        return;
    }

    const sendBtn = drawer.querySelector('.chat-msg-send-btn');
    const inputField = drawer.querySelector('.chat-text-input-field');
    const streamContainer = drawer.querySelector('.chat-message-display-stream');
    const fileInput = document.getElementById('chat-hidden-file-input');

    const LOCAL_CACHE_KEY = 'g_lite_chat_stream_data_array';

    // ==========================================
    // STABILIZED DOM RENDERING ENGINE (INCREMENTAL)
    // ==========================================

    /**
     * Builds the string element for a single chat message row.
     */
    function buildMessageBubbleHTML(msg) {
        const isUser = msg.sender_role === "user" || msg.sender_role !== "admin";
        const alignmentClass = isUser ? "outgoing" : "incoming";

        let additionalModifierClass = "";
        if (msg.isSending) additionalModifierClass = " msg-bubble-is-sending";
        if (msg.isFailed) additionalModifierClass = " msg-bubble-execution-failed";

        let mediaContentHTML = "";
        if (msg.attachment_url) {
            mediaContentHTML = `<img src="${msg.attachment_url}" style="max-width:100%; border-radius:6px; margin-bottom:4px; display:block;" alt="Media Object">`;
        }

        let statusIndicatorMessage = "";
        if (msg.isSending) statusIndicatorMessage = ` <small class="text-sending-indicator" style="opacity:0.7;">⏱️ Sending...</small>`;
        if (msg.isFailed) statusIndicatorMessage = ` <small class="text-failed-indicator" style="color:#ef4444;">🔴 Failed to Sync</small>`;

        const timeString = msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : "--:--";

        return `
            ${mediaContentHTML}
            <p>${escapeHTML(msg.message_body || '')}</p>
            <span class="msg-timestamp">${timeString}${statusIndicatorMessage}</span>
        `;
    }

    /**
     * Synchronizes message states incrementally with the live DOM tree to destroy flickering completely.
     */
    function renderChatFeedFromDataArray(messagesArray, forceScrollToBottom = false) {
        if (!streamContainer) return;

        // 1. Calculate safe scroll padding thresholds before manipulating elements
        const currentScrollTop = streamContainer.scrollTop;
        const currentScrollHeight = streamContainer.scrollHeight;
        const currentClientHeight = streamContainer.clientHeight;

        // Determine if the user is currently locked to the bottom boundary zone
        const wasAtBottom = currentScrollHeight - currentScrollTop <= currentClientHeight + 60;

        // Clear default footprint if data has arrived
        if (messagesArray.length > 0) {
            const defaultGreeting = streamContainer.querySelector('[data-system-default="true"]');
            if (defaultGreeting) defaultGreeting.remove();
        }

        if (messagesArray.length === 0 && streamContainer.children.length === 0) {
            streamContainer.innerHTML = `
                <div class="msg-bubble incoming" data-system-default="true">
                    <p>Hello, how can we assist your capital operations today?</p>
                    <span class="msg-timestamp">System Desk</span>
                </div>`;
            return;
        }

        // 2. Incremental DOM synchronization loop
        messagesArray.forEach(msg => {
            const messageId = msg.id ? msg.id.toString() : '';
            let exactExistingNode = null;
            if (messageId) {
                exactExistingNode = streamContainer.querySelector(`[data-msg-node-id="${messageId}"]`);
            }

            if (exactExistingNode) {
                const isStatusChanged = msg.isSending !== exactExistingNode.classList.contains('msg-bubble-is-sending') ||
                    msg.isFailed !== exactExistingNode.classList.contains('msg-bubble-execution-failed');

                if (isStatusChanged || messageId.startsWith('temp_msg_')) {
                    const isUser = msg.sender_role === "user" || msg.sender_role !== "admin";
                    const alignmentClass = isUser ? "outgoing" : "incoming";

                    exactExistingNode.className = `msg-bubble ${alignmentClass}${msg.isSending ? ' msg-bubble-is-sending' : ''}${msg.isFailed ? ' msg-bubble-execution-failed' : ''}`;
                    exactExistingNode.innerHTML = buildMessageBubbleHTML(msg);
                }
            } else {
                const isUser = msg.sender_role === "user" || msg.sender_role !== "admin";
                const alignmentClass = isUser ? "outgoing" : "incoming";
                const newBubbleElement = document.createElement('div');

                newBubbleElement.className = `msg-bubble ${alignmentClass}${msg.isSending ? ' msg-bubble-is-sending' : ''}${msg.isFailed ? ' msg-bubble-execution-failed' : ''}`;
                if (messageId) {
                    newBubbleElement.setAttribute('data-msg-node-id', messageId);
                }

                newBubbleElement.innerHTML = buildMessageBubbleHTML(msg);
                streamContainer.appendChild(newBubbleElement);
            }
        });

        // Delete any obsolete local placeholders cleanly
        const presentNodes = streamContainer.querySelectorAll('[data-msg-node-id]');
        presentNodes.forEach(node => {
            const nodeId = node.getAttribute('data-msg-node-id');
            const existsInPayload = messagesArray.some(m => m.id && m.id.toString() === nodeId);
            if (!existsInPayload && !nodeId.startsWith('temp_msg_')) {
                node.remove();
            }
        });

        // 3. SECURE BULLETPROOF IOS SCROLL ANCHOR LOGIC
        // Ensure an explicit layout target element exists at the end of the container matrix
        // 3. SECURE BULLETPROOF IOS SCROLL ANCHOR LOGIC
        let iOSScrollAnchor = streamContainer.querySelector('#ios-scroll-anchor-node');
        if (!iOSScrollAnchor) {
            iOSScrollAnchor = document.createElement('div');
            iOSScrollAnchor.id = 'ios-scroll-anchor-node';
            iOSScrollAnchor.style.clear = 'both';
            iOSScrollAnchor.style.height = '1px';
            iOSScrollAnchor.style.width = '100%';
            streamContainer.appendChild(iOSScrollAnchor);
        } else {
            streamContainer.appendChild(iOSScrollAnchor);
        }

        // Fire rendering offset execution blocks inside specialized hardware windows
        if (forceScrollToBottom || (wasAtBottom && !forceScrollToBottom)) {
            // Use standard direct pixel alignment calculations instead of scrollIntoView 
            // to bypass iOS Safari rendering restrictions completely
            requestAnimationFrame(() => {
                setTimeout(() => {
                    streamContainer.scrollTop = streamContainer.scrollHeight + 500;
                }, 30);
            });
        }
    }

    function hydrateChatFromLocalCache() {
        const cachedDataString = localStorage.getItem(LOCAL_CACHE_KEY);
        if (cachedDataString) {
            try {
                const parsedArray = JSON.parse(cachedDataString);
                renderChatFeedFromDataArray(parsedArray, false);
            } catch (err) {
                console.warn("⚠️ Chat array local cache parse error:", err);
            }
        } else if (streamContainer && streamContainer.children.length === 0) {
            streamContainer.innerHTML = `
                <div class="msg-bubble incoming" data-system-default="true">
                    <p>Hello, how can we assist your capital operations today?</p>
                    <span class="msg-timestamp">System Desk</span>
                </div>`;
        }
    }

    const openChatDrawerSystem = () => {
        drawer.classList.add('active', 'open');
        localStorage.setItem('g_lite_chat_state', 'open');

        if (triggerBtn) {
            triggerBtn.removeAttribute('data-count');
            triggerBtn.classList.remove('chat-notification-badge');
        }

        hydrateChatFromLocalCache();
        fetchLiveUserConversationStreams();
    };

    const closeChatDrawerSystem = () => {
        drawer.classList.remove('active', 'open');
        localStorage.setItem('g_lite_chat_state', 'closed');
    };

    const cachedChatState = localStorage.getItem('g_lite_chat_state');
    if (cachedChatState === 'open') {
        drawer.classList.add('active', 'open');
    }

    // ==========================================
    // EVENTS & TARGET OUTSIDE-CLICKS ARCHITECTURE
    // ==========================================

    if (triggerBtn) {
        triggerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isOpen = drawer.classList.contains('open');
            if (isOpen) {
                closeChatDrawerSystem();
            } else {
                openChatDrawerSystem();
            }
        });
    }

    document.addEventListener('click', (e) => {
        const isDrawerOpen = drawer.classList.contains('open') || drawer.classList.contains('active');
        if (isDrawerOpen) {
            const clickedInsideDrawer = drawer.contains(e.target);
            const clickedTriggerButton = triggerBtn && triggerBtn.contains(e.target);
            if (!clickedInsideDrawer && !clickedTriggerButton) {
                closeChatDrawerSystem();
            }
        }
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closeChatDrawerSystem();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeChatDrawerSystem();
    });

    // ==========================================
    // BACKEND STREAM FETCH & STABILIZED POLLING
    // ==========================================

    async function fetchLiveUserConversationStreams() {
        const userSessionToken = localStorage.getItem("user_session_token");
        if (!userSessionToken) return;

        try {
            const response = await fetch(`https://bssd-api.vercel.app/api/bank/admin-chat`, {
                method: "GET",
                headers: { "Authorization": `Bearer ${userSessionToken}` }
            });

            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.error);

            const freshIncomingChats = data.chats || [];

            // Read current local cache to manage items in flight safely
            const localCacheString = localStorage.getItem(LOCAL_CACHE_KEY);
            let activeUIArrayInstance = [];
            if (localCacheString) {
                try { activeUIArrayInstance = JSON.parse(localCacheString); } catch (e) { }
            }

            const inFlightMessages = activeUIArrayInstance.filter(m => m.isSending === true || m.isFailed === true);

            // Filter out tracking traces that already finished uploading securely
            const filteredInFlight = inFlightMessages.filter(localMsg =>
                !freshIncomingChats.some(serverMsg => serverMsg.id === localMsg.id)
            );

            // Commit structured remote payloads down to browser storage cache references
            localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(freshIncomingChats));

            const fullyUnifiedStreamMatrix = freshIncomingChats.concat(filteredInFlight);
            renderChatFeedFromDataArray(fullyUnifiedStreamMatrix, false);

        } catch (err) {
            console.error("Failed to synchronise real-time client chat streams:", err);
        }
    }

    hydrateChatFromLocalCache();
    fetchLiveUserConversationStreams();
    setInterval(fetchLiveUserConversationStreams, 4000);

    // ==========================================
    // OPTIMISTIC ARRAY MANIPULATION 
    // ==========================================

    function injectOptimisticUserChatBubble(textString, objectAssetUrl, targetTempId) {
        let historicalCachedArray = [];
        const localCacheString = localStorage.getItem(LOCAL_CACHE_KEY);

        if (localCacheString) {
            try { historicalCachedArray = JSON.parse(localCacheString); } catch (e) { }
        }

        // Clean out dangling local references cleanly
        historicalCachedArray = historicalCachedArray.filter(m => m.id && !m.id.toString().startsWith('temp_msg_'));

        const optimisticFakeRow = {
            id: targetTempId,
            sender_role: "user",
            message_body: textString,
            attachment_url: objectAssetUrl,
            created_at: new Date().toISOString(),
            isSending: true
        };

        historicalCachedArray.push(optimisticFakeRow);
        localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(historicalCachedArray));
        renderChatFeedFromDataArray(historicalCachedArray, true);
    }

    function markOptimisticBubbleExecutionStateAsDropped(targetTempId) {
        const localCacheString = localStorage.getItem(LOCAL_CACHE_KEY);
        if (!localCacheString) return;

        try {
            let messagesList = JSON.parse(localCacheString);
            const matchIndex = messagesList.findIndex(m => m.id === targetTempId);
            if (matchIndex !== -1) {
                messagesList[matchIndex].isSending = false;
                messagesList[matchIndex].isFailed = true;
                localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(messagesList));
                renderChatFeedFromDataArray(messagesList, false);
            }
        } catch (e) { }
    }

    // ==========================================
    // DISPATCH CHANNELS & MEDIA SUBMISSIONS
    // ==========================================

    const processMessageDispatch = async () => {
        const userSessionToken = localStorage.getItem("user_session_token");
        const messageText = inputField.value.trim();

        if (!messageText) return;
        if (!userSessionToken) {
            alert("Session credentials invalid. Log in again.");
            return;
        }

        const temporaryMessageId = `temp_msg_${Date.now()}`;

        injectOptimisticUserChatBubble(messageText, null, temporaryMessageId);
        inputField.value = '';

        try {
            const response = await fetch("https://bssd-api.vercel.app/api/bank/admin-chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${userSessionToken}`
                },
                body: JSON.stringify({
                    message_body: messageText,
                    attachment_url: null
                })
            });

            if (!response.ok) throw new Error("Server storage drop.");
            const data = await response.json();

            if (data.success && data.message) {
                const localCacheString = localStorage.getItem(LOCAL_CACHE_KEY);
                if (localCacheString) {
                    try {
                        let messagesList = JSON.parse(localCacheString);
                        const matchIndex = messagesList.findIndex(m => m.id === temporaryMessageId);

                        if (matchIndex !== -1) {
                            // Erase placeholder reference and replace target element seamlessly with clean database fields
                            const oldBubbleNode = streamContainer.querySelector(`[data-msg-node-id="${temporaryMessageId}"]`);
                            if (oldBubbleNode && data.message.id) {
                                oldBubbleNode.setAttribute('data-msg-node-id', data.message.id.toString());
                            }

                            messagesList[matchIndex] = data.message;
                            messagesList[matchIndex].isSending = false;
                            messagesList[matchIndex].isFailed = false;

                            localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(messagesList));
                            renderChatFeedFromDataArray(messagesList, true);
                            return;
                        }
                    } catch (e) { }
                }
            }

            await fetchLiveUserConversationStreams();

        } catch (err) {
            console.error("Live message dispatch failed:", err);
            markOptimisticBubbleExecutionStateAsDropped(temporaryMessageId);
        }
    };

    if (fileInput) {
        fileInput.addEventListener('change', async (e) => {
            if (e.target.files.length === 0) return;

            const userSessionToken = localStorage.getItem("user_session_token");
            if (!userSessionToken) return;

            const userUuid = localStorage.getItem("user_uuid") || "";
            const fileObj = e.target.files[0];
            const localOptimisticObjectURL = URL.createObjectURL(fileObj);
            const temporaryMessageId = `temp_msg_${Date.now()}`;

            injectOptimisticUserChatBubble("[Image Asset Attachment]", localOptimisticObjectURL, temporaryMessageId);

            const formPayload = new FormData();
            formPayload.append("avatar", fileObj);

            try {
                const response = await fetch("https://bssd-api.vercel.app/api/bank/avatar", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${userSessionToken}`,
                        "X-Action": "chat",
                        "X-User-UUID": userUuid
                    },
                    body: formPayload
                });

                const data = await response.json();
                if (!response.ok || !data.success) throw new Error(data.error);

                URL.revokeObjectURL(localOptimisticObjectURL);

                const finalResponse = await fetch("https://bssd-api.vercel.app/api/bank/admin-chat", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${userSessionToken}`
                    },
                    body: JSON.stringify({
                        message_body: "[Image Asset Attachment]",
                        attachment_url: data.imageUrl
                    })
                });

                const finalData = await finalResponse.json();

                if (finalResponse.ok && finalData.success && finalData.message) {
                    const localCacheString = localStorage.getItem(LOCAL_CACHE_KEY);
                    if (localCacheString) {
                        try {
                            let messagesList = JSON.parse(localCacheString);
                            const matchIndex = messagesList.findIndex(m => m.id === temporaryMessageId);

                            if (matchIndex !== -1) {
                                const oldBubbleNode = streamContainer.querySelector(`[data-msg-node-id="${temporaryMessageId}"]`);
                                if (oldBubbleNode && finalData.message.id) {
                                    oldBubbleNode.setAttribute('data-msg-node-id', finalData.message.id.toString());
                                }

                                messagesList[matchIndex] = finalData.message;
                                messagesList[matchIndex].isSending = false;
                                messagesList[matchIndex].isFailed = false;

                                localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(messagesList));
                                renderChatFeedFromDataArray(messagesList, true);
                                return;
                            }
                        } catch (e) { }
                    }
                }

                await fetchLiveUserConversationStreams();

            } catch (err) {
                console.error("Asset upload dispatch exception:", err);
                markOptimisticBubbleExecutionStateAsDropped(temporaryMessageId);
            }
        });
    }

    if (sendBtn) sendBtn.addEventListener('click', processMessageDispatch);
    if (inputField) {
        inputField.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                processMessageDispatch();
            }
        });
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'\"]/g,
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }
});