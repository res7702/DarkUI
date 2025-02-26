import { RoomChatSettings, RoomObjectCategory } from '@nitrots/nitro-renderer';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { ChatBubbleMessage, GetRoomEngine } from '../../../../api';

interface ChatWidgetMessageViewProps
{
    chat: ChatBubbleMessage;
    makeRoom: (chat: ChatBubbleMessage) => void;
    bubbleWidth?: number;
}

// Link regex to detect URLs in text
const URL_PATTERN = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;

// Function to safely convert URLs to anchor tags while escaping HTML
const addLinksToText = (text: string): string => {
    // First escape HTML to prevent XSS
    const escapeHTML = (str: string): string => {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };
    
    // Escape the HTML first
    const escapedText = escapeHTML(text);
    
    // Replace URLs with anchor tags
    return escapedText.replace(URL_PATTERN, (url) => {
        // Additional URL validation can be added here if needed
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });
};

export const ChatWidgetMessageView: FC<ChatWidgetMessageViewProps> = props =>
{
    const { chat = null, makeRoom = null, bubbleWidth = RoomChatSettings.CHAT_BUBBLE_WIDTH_NORMAL } = props;
    const [ isVisible, setIsVisible ] = useState(false);
    const [ isReady, setIsReady ] = useState<boolean>(false);
    const elementRef = useRef<HTMLDivElement>();

    const getBubbleWidth = useMemo(() =>
    {
        switch(bubbleWidth)
        {
            case RoomChatSettings.CHAT_BUBBLE_WIDTH_NORMAL:
                return 350;
            case RoomChatSettings.CHAT_BUBBLE_WIDTH_THIN:
                return 240;
            case RoomChatSettings.CHAT_BUBBLE_WIDTH_WIDE:
                return 2000;
        }
    }, [ bubbleWidth ]);

    // Process the message text to include safe links
    const processedMessage = useMemo(() => {
        return addLinksToText(chat?.formattedText || '');
    }, [chat?.formattedText]);

    useEffect(() =>
    {
        setIsVisible(false);
        
        const element = elementRef.current;

        if(!element) return;

        const width = element.offsetWidth;
        const height = element.offsetHeight;

        chat.width = width;
        chat.height = height;
        chat.elementRef = element;
        
        let left = chat.left;
        let top = chat.top;

        if(!left && !top)
        {
            left = (chat.location.x - (width / 2));
            top = (element.parentElement.offsetHeight - height);
            
            chat.left = left;
            chat.top = top;
        }

        setIsReady(true);

        return () =>
        {
            chat.elementRef = null;

            setIsReady(false);
        }
    }, [ chat ]);

    useEffect(() =>
    {
        if(!isReady || !chat || isVisible) return;
        
        if(makeRoom) makeRoom(chat);

        setIsVisible(true);
    }, [ chat, isReady, isVisible, makeRoom ]);

    // Handle link clicks to prevent default bubble click behavior when clicking links
    const handleMessageClick = (event: React.MouseEvent<HTMLElement>) => {
        const target = event.target as HTMLElement;
        if (target.tagName === 'A') {
            event.stopPropagation(); // Prevent room object selection when clicking links
        }
    };

    return (
        <div ref={ elementRef } className={ `bubble-container ${ isVisible ? 'visible' : 'invisible' }` } onClick={ event => GetRoomEngine().selectRoomObject(chat.roomId, chat.senderId, RoomObjectCategory.UNIT) }>
            { (chat.styleId === 0) &&
                <div className="user-container-bg" style={ { backgroundColor: chat.color } } /> }
            <div className={ `chat-bubble bubble-${ chat.styleId } type-${ chat.type }` } style={ { maxWidth: getBubbleWidth } }>
                <div className="user-container">
                    { chat.imageUrl && (chat.imageUrl.length > 0) &&
                        <div className="user-image" style={ { backgroundImage: `url(${ chat.imageUrl })` } } /> }
                </div>
                <div className="chat-content">
                    <b className="username mr-1" dangerouslySetInnerHTML={ { __html: `${ chat.username }: ` } } />
                    <span 
                        className="message" 
                        dangerouslySetInnerHTML={ { __html: processedMessage } }
                        onClick={handleMessageClick}
                    />
                </div>
                <div className="pointer" />
            </div>
        </div>
    );
}