let activeChatSessionUserUuid = null;
let currentChatPaginationPage = 1;
const chatMaxLimitPerPage = 20;
let isChatInfiniteScrollLoading = false;
let absoluteHasOlderDatabaseMessages = true;

export function setupSecureChatChannel(userUuid) {
    activeChatSessionUserUuid = userUuid;
    currentChatPaginationPage = 1;
    absoluteHasOlderDatabaseMessages = true;
    isChatInfiniteScrollLoading = false;

    const textInput = document.getElementById("chat-terminal-text-field");
    const sendBtn = document.getElementById("chat-send-message-btn");
    const attachBtn = document.getElementById("chat-attachment-trigger-btn");
    const hiddenFile = document.getElementById("chat-image-attachment-input");
    const feedElementContainer = document.getElementById("chat-message-feed");

    // ==========================================================================
    // HYDRATION: LOAD PRE-CACHED LATEST LOGS IMMEDIATELY (ZERO DELAY)
    // ==========================================================================
    const localizedCacheKey = `admin_chat_history_${activeChatSessionUserUuid}`;
    const historicalLocalMessages = localStorage.getItem(localizedCacheKey);

    if (historicalLocalMessages) {
        try {
            const cachedObjectArray = JSON.parse(historicalLocalMessages);
            renderChatMessageFeedFromCacheArray(cachedObjectArray, false);
        } catch (err) {
            console.warn("⚠️ Chat local cache parse error:", err);
        }
    } else {
        if (feedElementContainer) {
            feedElementContainer.innerHTML = `
                <div class="system-security-notice-bubble">
                    <i data-lucide="lock" class="inline-status-icon"></i>
                    <span>Initializing transaction secure conversation channel matrices...</span>
                </div>`;
            if (window.lucide) lucide.createIcons();
        }
    }

    // Load fresh baseline message feed from database
    fetchSecureConversationStreams(true);

    // Wire up continuous view scroll history triggers
    if (feedElementContainer) {
        feedElementContainer.onscroll = async () => {
            if (feedElementContainer.scrollTop === 0 && !isChatInfiniteScrollLoading && absoluteHasOlderDatabaseMessages) {
                await fetchOlderHistoricalChatLogs();
            }
        };
    }

    // Detach old layout handlers to preserve stack traces on workspace switching
    sendBtn.onclick = null;
    attachBtn.onclick = null;
    hiddenFile.onchange = null;

    // FIX: INJECT OPTIMISTIC BUBBLE SYNCHRONOUSLY ON CLICK BEFORE CALLING ASYNC STACK
    sendBtn.onclick = async () => {
        const text = textInput.value.trim();
        if (!text) return;

        textInput.value = ""; // Clear input instantly

        const temporaryMessageId = `temp_msg_${Date.now()}`;
        // Force the text bubble onto the DOM immediately before hitting server or SMTP latency
        injectOptimisticChatBubbleNode(text, null, temporaryMessageId);

        // Pass the already injected temporary tracking ID down to the background dispatcher
        await dispatchMessagePayload(text, null, temporaryMessageId);
    };

    attachBtn.onclick = () => hiddenFile.click();
    hiddenFile.onchange = async (e) => {
        if (e.target.files.length > 0) {
            const targetFile = e.target.files[0];
            const localOptimisticObjectURL = URL.createObjectURL(targetFile);
            const temporaryMessageId = `temp_msg_${Date.now()}`;

            // Clean, natural placeholder text instead of bracketed high-spam words
            const attachmentPlaceholderText = "Shared a secure file document update.";

            // Force clean textual payload layout into UI tracking view instantly
            injectOptimisticChatBubbleNode(attachmentPlaceholderText, localOptimisticObjectURL, temporaryMessageId);
            const uploadedUrl = await clearFileAssetStorageUpload(targetFile);

            if (uploadedUrl) {
                URL.revokeObjectURL(localOptimisticObjectURL);
                // Dispatch natural transaction language directly down the API payload channel
                await dispatchMessagePayload(attachmentPlaceholderText, uploadedUrl, temporaryMessageId);
            } else {
                markOptimisticBubbleExecutionStateAsDropped(temporaryMessageId);
            }
        }
    };
}

function renderChatMessageFeedFromCacheArray(messagesArray, preserveScrollPosition = false) {
    const feed = document.getElementById("chat-message-feed");
    if (!feed) return;

    const previousScrollHeight = feed.scrollHeight;

    feed.innerHTML = `
        <div class="system-security-notice-bubble">
            <i data-lucide="lock" class="inline-status-icon"></i>
            <span>Messages are synced over administrative ledger configurations.</span>
        </div>`;

    if (window.lucide) lucide.createIcons();

    messagesArray.forEach(msg => {
        const container = document.createElement("div");
        const isAdmin = msg.sender_role === "admin";
        const alignmentClass = isAdmin ? "outgoing" : "incoming";

        container.className = `msg-bubble ${alignmentClass}`;

        if (msg.isSending) container.classList.add("msg-bubble-is-sending");
        if (msg.isFailed) container.classList.add("msg-bubble-execution-failed");
        if (msg.id) container.setAttribute("data-msg-node-id", msg.id);

        let attachmentContentHTML = "";
        if (msg.attachment_url) {
            attachmentContentHTML = `<img src="${msg.attachment_url}" style="max-width:100%; border-radius:6px; margin-bottom:4px; display:block;" alt="Media Asset">`;
        }

        let statusIndicatorMessage = "";
        if (msg.isSending) statusIndicatorMessage = ` <small class="text-sending-indicator">⏱️ Sending...</small>`;
        if (msg.isFailed) statusIndicatorMessage = ` <small class="text-failed-indicator">🔴 Failed to Sync</small>`;

        const timeString = msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : "--:--";

        container.innerHTML = `
            ${attachmentContentHTML}
            <p>${escapeHTML(msg.message_body || '')}</p>
            <span class="msg-timestamp">${timeString}${statusIndicatorMessage}</span>
        `;
        feed.appendChild(container);
    });

    if (preserveScrollPosition) {
        feed.scrollTop = feed.scrollHeight - previousScrollHeight;
    } else {
        feed.scrollTop = feed.scrollHeight;
    }
}

async function fetchSecureConversationStreams(isInitialLoad = false) {
    const adminToken = localStorage.getItem("admin_session_token");
    if (!activeChatSessionUserUuid) return;

    try {
        const r = await fetch(`https://bssd-api.vercel.app/api/bank/admin-chat?uuid=${activeChatSessionUserUuid}&page=1&limit=${chatMaxLimitPerPage}`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${adminToken}` }
        });
        const payload = await r.json();
        const incomingServerChats = payload.chats || [];

        absoluteHasOlderDatabaseMessages = payload.hasMore;

        const localizedCacheKey = `admin_chat_history_${activeChatSessionUserUuid}`;
        localStorage.setItem(localizedCacheKey, JSON.stringify(incomingServerChats));

        renderChatMessageFeedFromCacheArray(incomingServerChats, !isInitialLoad);

    } catch (err) {
        console.error("Chat baseline feed sync drop error:", err);
    }
}

async function fetchOlderHistoricalChatLogs() {
    if (isChatInfiniteScrollLoading || !absoluteHasOlderDatabaseMessages) return;

    isChatInfiniteScrollLoading = true;
    const adminToken = localStorage.getItem("admin_session_token");
    const nextPage = currentChatPaginationPage + 1;

    try {
        const response = await fetch(`https://bssd-api.vercel.app/api/bank/admin-chat?uuid=${activeChatSessionUserUuid}&page=${nextPage}&limit=${chatMaxLimitPerPage}`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${adminToken}` }
        });

        const payload = await response.json();
        const olderHistoricalChats = payload.chats || [];

        if (olderHistoricalChats.length > 0) {
            currentChatPaginationPage = nextPage;
            absoluteHasOlderDatabaseMessages = payload.hasMore;

            const localizedCacheKey = `admin_chat_history_${activeChatSessionUserUuid}`;
            let activeUIArrayInstance = [];
            const localCacheString = localStorage.getItem(localizedCacheKey);
            if (localCacheString) {
                try { activeUIArrayInstance = JSON.parse(localCacheString); } catch (e) { }
            }

            const concatenatedTimelineMerge = olderHistoricalChats.concat(activeUIArrayInstance);
            renderChatMessageFeedFromCacheArray(concatenatedTimelineMerge, true);
        } else {
            absoluteHasOlderDatabaseMessages = false;
        }

    } catch (err) {
        console.error("Error running backward history paginator sync routines:", err);
    } finally {
        isChatInfiniteScrollLoading = false;
    }
}

function injectOptimisticChatBubbleNode(textString, objectAssetUrl, targetTempId) {
    const localizedCacheKey = `admin_chat_history_${activeChatSessionUserUuid}`;
    let historicalCachedArray = [];

    const localCacheString = localStorage.getItem(localizedCacheKey);
    if (localCacheString) {
        try { historicalCachedArray = JSON.parse(localCacheString); } catch (e) { }
    }

    const optimisticFakeRow = {
        id: targetTempId,
        sender_role: "admin",
        message_body: textString,
        attachment_url: objectAssetUrl,
        created_at: new Date().toISOString(),
        isSending: true
    };

    historicalCachedArray.push(optimisticFakeRow);

    if (historicalCachedArray.length > chatMaxLimitPerPage) {
        historicalCachedArray = historicalCachedArray.slice(-chatMaxLimitPerPage);
    }

    localStorage.setItem(localizedCacheKey, JSON.stringify(historicalCachedArray));
    renderChatMessageFeedFromCacheArray(historicalCachedArray, false);
}

function markOptimisticBubbleExecutionStateAsDropped(targetTempId) {
    const localizedCacheKey = `admin_chat_history_${activeChatSessionUserUuid}`;
    const localCacheString = localStorage.getItem(localizedCacheKey);
    if (!localCacheString) return;

    try {
        let messagesList = JSON.parse(localCacheString);
        const matchIndex = messagesList.findIndex(m => m.id === targetTempId);
        if (matchIndex !== -1) {
            messagesList[matchIndex].isSending = false;
            messagesList[matchIndex].isFailed = true;
            localStorage.setItem(localizedCacheKey, JSON.stringify(messagesList));
            renderChatMessageFeedFromCacheArray(messagesList, true);
        }
    } catch (e) { }
}

async function dispatchMessagePayload(text, fileUrl, replacementTargetTempId = null) {
    const adminToken = localStorage.getItem("admin_session_token");
    const temporaryMessageId = replacementTargetTempId || `temp_msg_${Date.now()}`;

    if (!replacementTargetTempId) {
        injectOptimisticChatBubbleNode(text, fileUrl, temporaryMessageId);
    }

    try {
        const response = await fetch("https://bssd-api.vercel.app/api/bank/admin-chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminToken}`
            },
            body: JSON.stringify({
                user_uuid: activeChatSessionUserUuid,
                message_body: text,
                attachment_url: fileUrl
            })
        });

        if (!response.ok) throw new Error("Server storage drop exception.");

        const resultData = await response.json();

        if (resultData.success && resultData.message) {
            const localizedCacheKey = `admin_chat_history_${activeChatSessionUserUuid}`;
            const localCacheString = localStorage.getItem(localizedCacheKey);

            if (localCacheString) {
                try {
                    let messagesList = JSON.parse(localCacheString);
                    const matchIndex = messagesList.findIndex(m => m.id === temporaryMessageId);

                    if (matchIndex !== -1) {
                        messagesList[matchIndex] = resultData.message;
                        messagesList[matchIndex].isSending = false;
                        messagesList[matchIndex].isFailed = false;

                        localStorage.setItem(localizedCacheKey, JSON.stringify(messagesList));
                        renderChatMessageFeedFromCacheArray(messagesList, false);
                        return;
                    }
                } catch (e) {
                    console.error("Cache processing stabilization failure:", e);
                }
            }
        }

        currentChatPaginationPage = 1;
        await fetchSecureConversationStreams(true);

    } catch (err) {
        console.error("Transmission fault instance recorded:", err);
        markOptimisticBubbleExecutionStateAsDropped(temporaryMessageId);
    }
}

async function clearFileAssetStorageUpload(file) {
    const adminToken = localStorage.getItem("admin_session_token");
    const formData = new FormData();
    formData.append("avatar", file);

    try {
        const response = await fetch("https://bssd-api.vercel.app/api/bank/avatar", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${adminToken}`,
                "X-Action": "chat", // 🚀 FIX: Tell the backend this is a chat file, not a profile avatar
                "X-User-UUID": activeChatSessionUserUuid
            },
            body: formData
        });
        const data = await response.json();
        return data.success ? data.imageUrl : null;
    } catch (err) {
        console.error("File Asset critical transport drop:", err);
        return null;
    }
}

function escapeHTML(str) {
    return str.replace(/[&<>'\"]/g,
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}