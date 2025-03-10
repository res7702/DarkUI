import { NavigatorSearchComposer, NavigatorSearchResultList } from '@nitrots/nitro-renderer';
import { FC, useEffect, useState } from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { LocalizeText, NavigatorSearchResultViewDisplayMode, SendMessageComposer } from '../../../../api';
import { AutoGridProps, Column, Flex, Grid, Text } from '../../../../common';
import { useNavigator } from '../../../../hooks';
import { NavigatorSearchResultItemView } from './NavigatorSearchResultItemView';

export interface NavigatorSearchResultViewProps extends AutoGridProps
{
    searchResult: NavigatorSearchResultList;
}

export const NavigatorSearchResultView: FC<NavigatorSearchResultViewProps> = props =>
{
    const { searchResult = null, ...rest } = props;
    const [ isExtended, setIsExtended ] = useState(true);
    const [ displayMode, setDisplayMode ] = useState<number>(0);

    const { topLevelContext = null } = useNavigator();

    const getResultTitle = () =>
    {
        let name = searchResult.code;

        if(!name || !name.length || LocalizeText('navigator.searchcode.title.' + name) == ('navigator.searchcode.title.' + name)) return searchResult.data;

        if(name.startsWith('${')) return name.slice(2, (name.length - 1));

        return ('navigator.searchcode.title.' + name);
    }

    const toggleDisplayMode = () =>
    {
        setDisplayMode(prevValue =>
        {
            if(prevValue === NavigatorSearchResultViewDisplayMode.LIST) return NavigatorSearchResultViewDisplayMode.THUMBNAILS;

            return NavigatorSearchResultViewDisplayMode.LIST;
        });
    }
    
    const showMore = () => 
    {
        if(searchResult.action == 1) SendMessageComposer(new NavigatorSearchComposer(searchResult.code, ''));
        else if(searchResult.action == 2 && topLevelContext) SendMessageComposer(new NavigatorSearchComposer(topLevelContext.code,''));
    }

    useEffect(() =>
    {
        if(!searchResult) return;

        setIsExtended(!searchResult.closed);
        
        setDisplayMode(searchResult.mode);
    }, [ searchResult ]);

    const gridHasTwoColumns = (displayMode >= NavigatorSearchResultViewDisplayMode.THUMBNAILS);
    
    return (
        <Column className="mt-1" gap={ 0 }>
            <Flex fullWidth alignItems="center" justifyContent="between" className="px-2 py-1 mb-3" style={{borderBottom: "1px solid #363636"}}>
                <Flex grow pointer alignItems="center" gap={ 1 } onClick={ event => setIsExtended(prevValue => !prevValue) }>
                    <Text variant='white' style={{fontSize: "14px"}}>{ LocalizeText(getResultTitle()) }</Text>
                </Flex>
                <Flex gap={ 2 } onClick={ event => setIsExtended(prevValue => !prevValue) }>
                    { isExtended && <FaPlus className="text-white fa-icon" /> }
                    { !isExtended && <FaMinus className="text-white fa-icon" /> }
                </Flex>
            </Flex> 
            { isExtended && 
                <>
                    {
                        <Grid columnCount={ 1 } className="navigator-grid" gap={ 0 }>
                            { searchResult.rooms.length > 0 && searchResult.rooms.map((room, index) => <NavigatorSearchResultItemView key={ index } roomData={ room } />) }
                        </Grid>
                    }
                </>
            }
        </Column>
        // <div className="nitro-navigator-search-result bg-white rounded mb-2 overflow-hidden">
        //     <div className="d-flex flex-column">
        //         <div className="d-flex align-items-center px-2 py-1 text-black">
        //             <i className={ 'text-secondary fas ' + (isExtended ? 'fa-minus' : 'fa-plus') } onClick={ toggleExtended }></i>
        //             <div className="ms-2 flex-grow-1">{ LocalizeText(getResultTitle()) }</div>
        //             <i className={ 'text-secondary fas ' + classNames({ 'fa-bars': (displayMode === NavigatorSearchResultViewDisplayMode.LIST), 'fa-th': displayMode >= NavigatorSearchResultViewDisplayMode.THUMBNAILS })}></i>
        //         </div>
        //         { isExtended &&
        //             <div className={ 'nitro-navigator-result-list row row-cols-' + classNames({ '1': (displayMode === NavigatorSearchResultViewDisplayMode.LIST), '2': (displayMode >= NavigatorSearchResultViewDisplayMode.THUMBNAILS) }) }>
        //                 { searchResult.rooms.length > 0 && searchResult.rooms.map((room, index) =>
        //                     {
        //                         return <NavigatorSearchResultItemView key={ index } roomData={ room } />
        //                     }) }
        //             </div> }
        //     </div>
        // </div>
        // <div className="nitro-navigator-result-list p-2">
        //     <div className="d-flex mb-2 small cursor-pointer" onClick={ toggleList }>
        //         <i className={ "fas " + classNames({ 'fa-plus': !isExtended, 'fa-minus': isExtended })}></i>
        //         <div className="align-self-center w-100 ml-2">{ LocalizeText(getListCode()) }</div>
        //         <i className={ "fas " + classNames({ 'fa-bars': displayMode === NavigatorResultListViewDisplayMode.LIST, 'fa-th': displayMode >= NavigatorResultListViewDisplayMode.THUMBNAILS })} onClick={ toggleDisplayMode }></i>
        //     </div>
        //     <div className={ 'row mr-n2 row-cols-' + classNames({ '1': displayMode === NavigatorResultListViewDisplayMode.LIST, '2': displayMode >= NavigatorResultListViewDisplayMode.THUMBNAILS }) }>
        //         { isExtended && resultList && resultList.rooms.map((room, index) =>
        //             {
        //                 return <NavigatorResultView key={ index } result={ room } />
        //             })
        //         }
        //     </div>
        // </div>
    );
}
