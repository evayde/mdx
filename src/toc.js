import { ele } from './tools.js';

let showPreview = mdx_show_preview.preview === 'true' ? true : false;
let tocShown = false;
let titleArr = [];
let firstClick = false;
let isToc = true;
let previewShown = false;
let mdx_toc = undefined;
let isInited = false;

window.addEventListener('DOMContentLoaded', () => {
    let tocHTML = getTitleListHtml();
    addToc(tocHTML[0]);
    if(isToc){
        if(showPreview){
            ele('.PostMain').insertAdjacentHTML('beforeend', `<div id="mdx-toc-preview" mdui-drawer="${document.getElementById('menu').getAttribute('mdui-drawer')}">${tocHTML[1]}</div>`);
            mdui.mutation();
        }
        isInited = true;
        scrollToc(true);
    }
})

function getTitleListHtml(minLevel = 1, maxLevel = 6) {
    const titleList = document.querySelectorAll(
        [...Array(maxLevel).keys()].map((l) => `article > h${l + 1}`).join(',')
    );
    if (titleList.length <= 1) {
        isToc = false;
        return false;
    }
  
    const finalNode = document.createElement('div');
    finalNode.classList.add('mdui-list');
    finalNode.id = 'mdx-toc';
    finalNode.style.transform = 'translateX(0)';
  
    let finalPreview = "";
  
    let counter = 0;
    let titles = [...Array(maxLevel)].map(() => 0);
    for (const title of titleList) {
        title.dataset.mdxtoc = 'mdx-toc-' + counter;
        titleArr.push('mdx-toc-' + counter);
  
        const level = Number(ele(title).tagName[1]);
        titles[level - 1]++;
        titles.forEach((_, i) =>
            i >= level ? (titles[i] = 0) : titles[i] === 0 && (titles[i] = 1)
        );
  
        const titleNode = document.createElement('a');
        titleNode.id = `mdx-toc-${counter}-item`;
        titleNode.title = title.textContent;
        titleNode.classList.add('mdui-list-item', 'mdui-ripple', 'mdx-toc-item');
  
        if (level > 1) {
            titleNode.classList.add(`mdx-toc-item-h${level}`);
        }
  
        const titleNodeSpan = document.createElement('span');
        titleNodeSpan.textContent = titles
            .filter((_, i) => i + 1 >= minLevel && i < level)
            .join('.');
  
        const tilteNodeContent = document.createElement('div');
        tilteNodeContent.textContent = title.textContent;
  
        titleNode.appendChild(titleNodeSpan);
        titleNode.appendChild(tilteNodeContent);
        finalNode.appendChild(titleNode);
  
        finalPreview += `<div class="mdx-toc-preview-h${level} mdx-toc-preview-item mdui-color-theme" id="mdx-toc-${counter}-preview"></div>`;
        counter++;
    }
    return [finalNode, finalPreview];
}
  
function addToc(titleList) {
    if (!titleList) {
        return;
    }
  
    const menu = document.querySelector('#mdx_menu');
    menu.parentNode.append(titleList);
  
    ele('#left-drawer nav').insertAdjacentHTML('beforebegin', `<div class="mdui-tab mdui-tab-full-width" id="mdx-toc-select"><a href="#" id="mdx-toc-menu" class="mdui-ripple"><i class="mdui-icon material-icons">&#xe241;</i><label>${mdx_toc_i18n_1}</label></a><a href="#" id="mdx-toc-toc" class="mdui-ripple"><i class="mdui-icon material-icons">&#xe86d;</i><label>${mdx_toc_i18n_2}</label></a></div>`);
    mdx_toc = new mdui.Tab('#mdx-toc-select', {});
    mdx_toc.next();
  
    menu.style.transform = `translateX(-${menu.clientWidth}px)`;
}

document.getElementById('menu').addEventListener('click', function() {
    if(!firstClick){
        scrollToc(false);
        tocShown = true;
        firstClick = true;
    }
}, false)

ele('.PostMain').addEventListener('click', function(e) {
    if(e.target.id === 'mdx-toc-preview'){
        if(getComputedStyle(ele('#mdx-toc'))['transform'] !== 'translateX(0)' && showPreview){
            mdx_toc.next();
            ele('#mdx-toc').style.transform = 'translateX(0)';
            ele('#mdx_menu').style.transform = `translateX(-${ele('#mdx_menu').getBoundingClientRect().width}px)`;
            if(!firstClick){
                scrollToc(false);
                tocShown = true;
                firstClick = true;
            }else{
                scrollToc(true);
                tocShown = true;
                firstClick = false;
            }
        }
    }
})

ele('#left-drawer').addEventListener('click', function(e) {
    if(e.target.id === 'mdx-toc-menu' || e.target.closest('#mdx-toc-menu') !== null){
        e.preventDefault();
        tocShown = false;
        ele('#mdx_menu').style.transform = 'translateX(0)';
        ele('#mdx-toc').style.transform = `translateX(${ele('#mdx-toc').getBoundingClientRect().width}px)`;
        return;
    }else if(e.target.id === 'mdx-toc-toc' || e.target.closest('#mdx-toc-toc') !== null){
        e.preventDefault();
        tocShown = true;
        scrollToc(false);
        ele('#mdx-toc').style.transform = 'translateX(0)';
        ele('#mdx_menu').style.transform = `translateX(-${ele('#mdx_menu').getBoundingClientRect().width}px)`;
        return;
    }else if(e.target.classList.contains('mdx-toc-item')){
        e.preventDefault();
        Velocity(ele('html'), {scrollTop: (ele(`article *[data-mdxtoc="mdx-toc-${e.target.getAttribute('id').split('-')[2]}"]`).getBoundingClientRect().top + window.pageYOffset - 75) + "px"}, 500);
        return;
    }else if(e.target.closest('.mdx-toc-item') !== null){
        e.preventDefault();
        Velocity(ele('html'), {scrollTop: (ele(`article *[data-mdxtoc="mdx-toc-${e.target.closest('.mdx-toc-item').getAttribute('id').split('-')[2]}"]`).getBoundingClientRect().top + window.pageYOffset - 75) + "px"}, 500);
        return;
    }
})

window.addEventListener('resize', function() {
    if(isToc){
        if(tocShown || !firstClick){
            ele('#mdx-toc').style.transform = 'translateX(0)';
            ele('#mdx_menu').style.transform = `translateX(-${ele('#mdx_menu').getBoundingClientRect().width}px)`;
        }else{
            ele('#mdx_menu').style.transform = 'translateX(0)';
            ele('#mdx-toc').style.transform = `translateX(${ele('#mdx-toc').getBoundingClientRect().width}px)`;
        }
    }
})

let tickingToc = false;
window.addEventListener('scroll', function(){
    if(isToc && isInited){
        if(!tickingToc) {
            requestAnimationFrame(function(){
                scrollToc(true);
            });
            tickingToc = true;
        }
    }
    
})
function scrollToc(firstCall){
    if(!isInited){
        return;
    }
    if(tocShown || firstCall){
        let howFar = document.documentElement.scrollTop || document.body.scrollTop;
        ele('.mdx-toc-item', (e) => {e.classList.remove('mdx-toc-read', 'mdui-list-item-active')});
        ele('#mdx-toc-preview > *', (e) => {e.classList.remove('mdx-toc-preview-item-active')});
        let counter = 0;
        if(howFar >= ele('article').getBoundingClientRect().top + window.pageYOffset + ele('article').clientHeight - 80){
            ele('.mdx-toc-item', (e) => {e.classList.add('mdx-toc-read')});
            if(previewShown && showPreview){
                document.getElementById('mdx-toc-preview').classList.remove('mdx-toc-preview-show');
                previewShown = false;
            }
        }else{
            for(let i = 1; i < titleArr.length; i++){
                if(howFar >= ele(`article *[data-mdxtoc="${titleArr[i]}"]`).getBoundingClientRect().top + window.pageYOffset - 80){
                    document.getElementById(`${titleArr[i-1]}-item`).classList.add('mdx-toc-read');
                    counter++;
                }else{
                    break;
                }
            }
            if(howFar > ele('article').getBoundingClientRect().top + window.pageYOffset - 140){
                if(!previewShown && showPreview){
                    document.getElementById('mdx-toc-preview').classList.add('mdx-toc-preview-show');
                    previewShown = true;
                }
                let item = ele(`#${titleArr[counter]}-item`);
                item.classList.add('mdui-list-item-active');
                ele(`#${titleArr[counter]}-preview`).classList.add('mdx-toc-preview-item-active');
                if(showPreview){
                    ele('#mdx-toc-preview').style.transform = `translateY(-${((counter+1)*20-4)}px)`;
                }
                if(item !== null){
                    let topDist = item.getBoundingClientRect().top;
                    if(topDist + 48 > window.innerHeight && tocShown){
                        Velocity(ele('#left-drawer'), {scrollTop: (document.getElementById('left-drawer').scrollTop + (topDist + 48 - window.innerHeight) + 8) + "px"}, {duration: 200, queue: false});
                    }else if(topDist < 8 && tocShown){
                        Velocity(ele('#left-drawer'), {scrollTop: (document.getElementById('left-drawer').scrollTop + topDist - 8) + "px"}, {duration: 200, queue: false});
                    }
                }
            }else{
                if(previewShown && showPreview){
                    document.getElementById('mdx-toc-preview').classList.remove('mdx-toc-preview-show');
                    previewShown = false;
                }
            }
        }
        
    }
    tickingToc = false;
};