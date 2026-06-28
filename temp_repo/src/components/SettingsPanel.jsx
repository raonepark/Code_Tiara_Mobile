import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, ChevronDown, GripVertical, Check, X, Trash2, Plus, RotateCcw, BookOpen } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { THEME_CONFIG } from '../constants/themeConfig';
import packageJson from '../../package.json';

const { ipcRenderer } = window.require ? window.require('electron') : {};



const SettingsPanel = ({
    isOpen, onClose, currentTheme, setCurrentTheme, theme,
    projectTitle, setProjectTitle, defaultTitle,
    focusDuration, setFocusDuration, breakDuration, setBreakDuration,
    fontSize, setFontSize, fontFamily, setFontFamily, categories, onDragEndCategories,
    activePicker, setActivePicker, updateCategory, addCategory,
    confirmingCategoryDeleteId, setConfirmingCategoryDeleteId,
    finalDeleteCategory, categoryToDelete, setCategoryToDelete,
    confirmDeleteCategory, exportData, triggerImport, fileInputRef, importData,
    handleResetRequest, isResetConfirming, getIcon, openOnboardingGuide,
    user, onSignOut, onLoginClick, onDeleteAccount, isMobile
}) => {
    const { t, i18n } = useTranslation();
    const [isThemeSettingsExpanded, setIsThemeSettingsExpanded] = useState(false);
    const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
    const langDropdownRef = useRef(null);
    const [isAutoLaunch, setIsAutoLaunch] = useState(false);

    useEffect(() => {
        if (ipcRenderer && isOpen) {
            ipcRenderer.invoke('get-auto-launch')
                .then((status) => setIsAutoLaunch(status))
                .catch((err) => console.error("Failed to load auto launch setting:", err));
        }
    }, [isOpen]);

    const handleAutoLaunchChange = (checked) => {
        if (ipcRenderer) {
            ipcRenderer.send('set-auto-launch', checked);
            setIsAutoLaunch(checked);
        }
    };



    useEffect(() => {
        const handleClickOutsideLang = (e) => {
            if (isLangDropdownOpen && langDropdownRef.current && !langDropdownRef.current.contains(e.target)) {
                setIsLangDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutsideLang);
        return () => document.removeEventListener('mousedown', handleClickOutsideLang);
    }, [isLangDropdownOpen]);

    if (!isOpen) return null;

    return (
        <div className="p-4 animate-in fade-in slide-in-from-bottom-4 duration-300 flex-1 overflow-y-auto custom-scrollbar">
            <div className="max-w-md mx-auto w-full space-y-4">
                {/* 🏷️ Header */}
                <div className="flex justify-between items-center mb-2">
                    <h2 className={`text-xl font-bold flex items-center gap-1.5 ${theme.titleText}`}>
                        <Settings className={`w-5 h-5 ${theme.titleText.split(' ')[0]}`} />
                        {t('settings.title')}
                    </h2>
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className={`flex items-center gap-1 text-xs px-3 py-1.5 transition-all shadow-sm font-bold ${theme.buttons.closeBtn}`}
                        >
                            {currentTheme === 'developer' ? '[ESC]' : <X className="w-3.5 h-3.5" />}
                            {currentTheme === 'developer' ? '' : t('settings.close')}
                        </button>

                    </div>
                </div>





                {/* 🎨 Theme Settings Card - Unified (Collapsible) */}
                <div className={theme.settings.wrapper}>
                    <div
                        onClick={() => setIsThemeSettingsExpanded(!isThemeSettingsExpanded)}
                        className={`flex items-center justify-between cursor-pointer ${theme.settings.header.replace('mb-3', 'mb-0')}`} // Remove bottom margin if collapsed
                    >
                        <div className="flex items-center gap-2">
                            <span>{t('settings.themeSettings')}</span>
                            {!isThemeSettingsExpanded && (
                                <span className={`text-[10px] font-normal px-2 py-0.5 rounded-full ${theme.themeBadge}`}>
                                    {theme.themeIcon} {theme.label}
                                </span>
                            )}
                        </div>
                        <ChevronDown className={`w-4 h-4 transition-transform ${isThemeSettingsExpanded ? 'rotate-180' : ''}`} />
                    </div>

                    {isThemeSettingsExpanded && (
                        <div className="flex gap-2 mt-3 animate-in slide-in-from-top-2 duration-200">
                            {Object.keys(THEME_CONFIG).map((key) => (
                                <button
                                    key={key}
                                    onClick={() => setCurrentTheme(key)}
                                    className={`flex-1 flex flex-col items-center justify-center p-3 transition-all duration-300 ease-in-out border focus:outline-none text-[10px] sm:text-xs ${currentTheme === key ? theme.themeSelectorActive : theme.themeSelectorInactive}`}
                                >
                                    <span className="text-xl mb-1">{THEME_CONFIG[key].themeIcon}</span>
                                    <span className="text-[10px] font-bold">{THEME_CONFIG[key].label}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Auto Launch Card */}
                {ipcRenderer && (
                    <div className={theme.settings.wrapper}>
                        <div className="flex justify-between items-center ml-1">
                            <span className={`text-xs font-bold ${theme.settings.sectionTitle} !mb-0 flex items-center`}>
                                {t('settings.autoLaunch')}
                            </span>
                            <button
                                type="button"
                                onClick={() => handleAutoLaunchChange(!isAutoLaunch)}
                                className={`relative inline-flex items-center flex-shrink-0 cursor-pointer transition-all duration-200 ease-in-out focus:outline-none ${
                                    currentTheme === 'princess'
                                        ? `h-5 w-9 rounded-full border border-transparent ${isAutoLaunch ? 'bg-[#FF6B81] shadow-[0_2px_6px_rgba(255,107,129,0.3)]' : 'bg-pink-100/80 border-pink-200/50'}`
                                        : currentTheme === 'excel'
                                        ? `h-5 w-9 rounded-none border ${isAutoLaunch ? 'bg-[#107C41] border-[#107C41]' : 'bg-white border-[#A19F9D] hover:border-[#605E5C]'}`
                                        : `h-5.5 w-10 rounded-sm border ${isAutoLaunch ? 'bg-[#E5C07B] border-[#E5C07B]' : 'bg-[#1E1E1E] border-[#3E3E42] hover:border-[#5C6370]'}`
                                }`}
                            >
                                <span
                                    className={`pointer-events-none inline-block transform transition duration-200 ease-in-out ${
                                        currentTheme === 'princess'
                                            ? `h-4 w-4 rounded-full bg-white shadow-[0_1px_3px_rgba(255,107,129,0.2)] ${isAutoLaunch ? 'translate-x-[16px]' : 'translate-x-0.5'}`
                                            : currentTheme === 'excel'
                                            ? `h-3.5 w-3.5 rounded-none ${isAutoLaunch ? 'bg-white translate-x-[18px]' : 'bg-[#605E5C] translate-x-0.5'}`
                                            : `h-3.5 w-3.5 rounded-sm ${isAutoLaunch ? 'bg-[#282C34] translate-x-[22px]' : 'bg-[#ABB2BF] translate-x-0.5'}`
                                    }`}
                                />
                            </button>
                        </div>
                    </div>
                )}

                {/* 🎨 Unified Category Management (All Themes use 'Editable Row') */}
                <div className={`p-3 border-t ${theme.divider}`}>
                    <div className={`text-sm mb-2 font-bold ${theme.settings.sectionTitle}`}>{t('settings.categoryManagement')}</div>
                    <DragDropContext onDragEnd={onDragEndCategories}>
                        <Droppable droppableId="categories-list">
                            {(provided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="space-y-2 overflow-visible"
                                >
                                    {categories.map((cat, index) => (
                                        <Draggable key={cat.id} draggableId={cat.id} index={index}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className={`relative transition-colors duration-200 group flex items-center ${theme.settings.listRow.wrapper} ${currentTheme === 'excel' ? (index % 2 === 0 ? 'bg-white' : 'bg-[#F9F9F9]') : ''} ${activePicker?.id === cat.id ? 'z-50' : 'z-0'} ${snapshot.isDragging ? 'shadow-lg z-[100]' : ''}`}
                                                >
                                                    {/* 🖐️ Drag Handle */}
                                                    {currentTheme === 'excel' ? (
                                                        <div {...provided.dragHandleProps} className="w-[30px] -ml-3 mr-2 self-stretch flex items-center justify-center bg-[#F3F2F1] border-r border-[#D1D1D1] text-[10px] text-slate-500 font-sans cursor-grab active:cursor-grabbing hover:bg-[#E1E1E1] transition-colors">
                                                            {index + 1}
                                                        </div>
                                                    ) : currentTheme === 'princess' ? (
                                                        <div {...provided.dragHandleProps} className="mr-2 cursor-grab active:cursor-grabbing text-[#FFB6C1] hover:bg-[#FFF0F5] p-1.5 rounded-full transition-colors flex items-center justify-center hover:text-[#FF6B81]">
                                                            <GripVertical className="w-4 h-4" />
                                                        </div>
                                                    ) : (
                                                        <div {...provided.dragHandleProps} className={`mr-2 cursor-grab active:cursor-grabbing p-1 transition-colors ${currentTheme === 'developer' ? 'text-[#5C6370] hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}>
                                                            <GripVertical className="w-4 h-4" />
                                                        </div>
                                                    )}

                                                    {/* 1. Icon Picker */}
                                                    <div className="relative">
                                                        <button
                                                            onClick={() => setActivePicker(activePicker?.id === cat.id && activePicker?.type === 'icon' ? null : { id: cat.id, type: 'icon' })}
                                                            className={`w-8 h-8 flex items-center justify-center transition-all ${theme.settings.listRow.iconTrigger} ${activePicker?.id === cat.id && activePicker?.type === 'icon' ? 'ring-2 ring-opacity-50 scale-110' : ''}`}
                                                        >
                                                            {currentTheme === 'developer' || currentTheme === 'excel' ? (
                                                                // 💻 Developer/Excel Theme (Standard/Outline Icons)
                                                                getIcon(cat.icon, `w-4 h-4 ${activePicker?.id === cat.id ? (currentTheme === 'excel' ? 'text-[#217346]' : 'text-[#61AFEF]') : (currentTheme === 'excel' ? 'text-slate-600' : 'text-[#ABB2BF]')}`)
                                                            ) : (
                                                                // 🎀 Princess / Default Icons (Emoji)
                                                                cat.icon === 'heart' ? '🎀' : (cat.icon === 'star' ? '⭐' : (cat.icon === 'coffee' ? '☕' : (cat.icon === 'music' ? '🎵' : (cat.icon === 'home' ? '🏠' : (cat.icon === 'briefcase' ? '💼' : (cat.icon === 'terminal' ? '💻' : (cat.icon === 'table' ? '📊' : (cat.icon === 'book' ? '📚' : (cat.icon === 'gift' ? '🎁' : (cat.icon === 'zap' ? '✨' : (cat.icon === 'code' ? '📝' : (cat.icon === 'alert' ? '⚠️' : (cat.icon === 'hourglass' ? '⏳' : (cat.icon === 'calendar' ? '📅' : '📌'))))))))))))))
                                                            )}
                                                        </button>
                                                        {/* Icon Popover */}
                                                        {activePicker?.id === cat.id && activePicker?.type === 'icon' && (
                                                            <>
                                                                <div className="fixed inset-0 z-[9998]" onClick={() => setActivePicker(null)}></div>
                                                                <div className={`absolute left-0 top-full mt-2 flex p-1 gap-1 z-[9999] animate-in fade-in zoom-in-95 ${theme.settings.popover} flex-wrap w-[186px]`}>
                                                                    {['star', 'heart', 'coffee', 'music', 'home', 'briefcase', 'terminal', 'gift', 'code', 'calendar'].map(icon => (
                                                                        <button
                                                                            key={icon}
                                                                            onClick={() => { updateCategory(cat.id, 'icon', icon); setActivePicker(null); }}
                                                                            className={`w-8 h-8 flex items-center justify-center transition-all duration-200 ${
                                                                                currentTheme === 'princess'
                                                                                    ? `rounded-full hover:bg-[#FFF0F5] ${cat.icon === icon ? 'bg-[#FFF0F5] ring-2 ring-[#FF6B81]' : ''}`
                                                                                    : currentTheme === 'excel'
                                                                                    ? `rounded-none hover:bg-[#E6F2EA] ${cat.icon === icon ? 'bg-[#E6F2EA] ring-1 ring-[#107C41]' : ''}`
                                                                                    : `rounded-md hover:bg-[#2C313A] text-[#ABB2BF] hover:text-white ${cat.icon === icon ? 'bg-[#2C313A] ring-1 ring-[#E5C07B]' : ''}`
                                                                            }`}
                                                                        >
                                                                            {currentTheme === 'developer' || currentTheme === 'excel' ? (
                                                                                getIcon(icon, 'w-4 h-4') // Use standard icons in picker too
                                                                            ) : (
                                                                                icon === 'heart' ? '🎀' : (icon === 'star' ? '⭐' : (icon === 'coffee' ? '☕' : (icon === 'music' ? '🎵' : (icon === 'home' ? '🏠' : (icon === 'briefcase' ? '💼' : (icon === 'terminal' ? '💻' : (icon === 'gift' ? '🎁' : (icon === 'code' ? '📝' : (icon === 'calendar' ? '📅' : '📌')))))))))
                                                                            )}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>

                                                    {/* 2. Name Input */}
                                                    <input
                                                        type="text"
                                                        value={cat.label}
                                                        onChange={(e) => updateCategory(cat.id, 'label', e.target.value)}
                                                        className={`flex-1 px-3 py-1.5 text-xs transition-all outline-none min-w-0 ${theme.settings.listRow.input}`}
                                                    />

                                                    {/* 3. Color Picker */}
                                                    <div className="relative flex items-center justify-center h-6">
                                                        <button
                                                            onClick={() => setActivePicker(activePicker?.id === cat.id && activePicker?.type === 'color' ? null : { id: cat.id, type: 'color' })}
                                                            className={`w-6 h-6 transition-all hover:scale-110 ${theme.settings.listRow.colorTrigger} ${activePicker?.id === cat.id && activePicker?.type === 'color' ? 'ring-2 ring-opacity-50 scale-110' : ''} ${(cat.colorTheme === 'princess' || cat.colorTheme === 'red') ? 'bg-[#FFC0CB]' :
                                                                (cat.colorTheme === 'blue' || cat.colorTheme === 'cyan') ? 'bg-[#AEE4FF]' :
                                                                    (cat.colorTheme === 'mint' || cat.colorTheme === 'emerald' || cat.colorTheme === 'green') ? 'bg-[#98FB98]' :
                                                                        (cat.colorTheme === 'purple') ? 'bg-[#DDA0DD]' :
                                                                            (cat.colorTheme === 'yellow') ? 'bg-[#FFB347]' : 'bg-slate-400'
                                                                }`}
                                                        />
                                                        {/* Color Popover */}
                                                        {activePicker?.id === cat.id && activePicker?.type === 'color' && (
                                                            <>
                                                                <div className="fixed inset-0 z-[9998]" onClick={() => setActivePicker(null)}></div>
                                                                <div className={`absolute right-0 top-full mt-2 flex p-1 gap-1 z-[9999] animate-in fade-in zoom-in-95 ${theme.settings.popover}`}>
                                                                    {['red', 'cyan', 'emerald', 'purple', 'yellow'].map(color => (
                                                                        <button
                                                                            key={color}
                                                                            onClick={() => { updateCategory(cat.id, 'colorTheme', color); setActivePicker(null); }}
                                                                            className={`w-6 h-6 border transition-all duration-200 hover:scale-110 ${
                                                                                currentTheme === 'princess'
                                                                                    ? 'rounded-full border-white/50 shadow-sm'
                                                                                    : currentTheme === 'excel'
                                                                                    ? 'rounded-none border-slate-200'
                                                                                    : 'rounded-none border-slate-700'
                                                                            } ${color === 'red' ? 'bg-[#FFC0CB]' :
                                                                                (color === 'cyan' ? 'bg-[#AEE4FF]' :
                                                                                    (color === 'emerald' ? 'bg-[#98FB98]' :
                                                                                        (color === 'purple' ? 'bg-[#DDA0DD]' : 'bg-[#FFB347]')))
                                                                            }`}
                                                                        />
                                                                    ))}
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>

                                                    {/* 4. Delete Button (Inline & Aligned) */}
                                                    {confirmingCategoryDeleteId === cat.id ? (
                                                        <div className="flex items-center gap-1 animate-in zoom-in-50 duration-200 ml-1">
                                                            <button
                                                                onClick={() => finalDeleteCategory(cat.id)}
                                                                className={`w-6 h-6 flex items-center justify-center shadow-sm transition-all ${
                                                                    currentTheme === 'princess' 
                                                                        ? 'rounded-full bg-[#FF6B81] text-white hover:bg-[#FF4757]' 
                                                                        : currentTheme === 'excel' 
                                                                        ? 'rounded-none bg-[#107C41] text-white hover:bg-[#0E6032]' 
                                                                        : 'rounded-none bg-[#E06C75] text-[#1E1E1E] hover:bg-[#FF6B81]'
                                                                }`}
                                                            >
                                                                <Check className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => setConfirmingCategoryDeleteId(null)}
                                                                className={`w-6 h-6 flex items-center justify-center shadow-sm transition-all ${
                                                                    currentTheme === 'princess' 
                                                                        ? 'rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200' 
                                                                        : currentTheme === 'excel' 
                                                                        ? 'rounded-none bg-[#F3F2F1] text-slate-700 border border-[#D1D5DB] hover:bg-[#E1E1E1]' 
                                                                        : 'rounded-none bg-[#2D2D2D] text-[#ABB2BF] border border-[#3E4451] hover:bg-[#3E3E42]'
                                                                }`}
                                                            >
                                                                <X className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setConfirmingCategoryDeleteId(cat.id)}
                                                            className={`w-6 h-6 flex items-center justify-center transition-all shadow-sm ${theme.settings.listRow.deleteBtn} ${currentTheme === 'developer' ? 'w-auto px-2 text-[10px] font-bold hover:text-[#E06C75]' : (currentTheme === 'excel' ? 'rounded-none' : 'rounded-full')}`}
                                                        >
                                                            {currentTheme === 'developer' ? '[DEL]' : <Trash2 className="w-3.5 h-3.5" />}
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                    <button onClick={addCategory} className={`w-full mt-3 py-2 text-xs font-bold flex items-center justify-center gap-1 transition-all ${theme.buttons.outlineBtn}`}>
                        <Plus className="w-3.5 h-3.5" /> <span className="text-xs font-bold">{t('settings.add')}</span>
                    </button>
                </div>
            </div>

            {/* 🌐 Language Settings */}
            <div className={`mt-6 pt-6 border-t ${theme.divider} max-w-md mx-auto`}>
                <div className={theme.settings.wrapper}>
                    <div className={theme.settings.header}>
                        {t('settings.language')}
                    </div>
                    <div className="relative font-select-dropdown" ref={langDropdownRef}>
                        <button
                            type="button"
                            onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                            className={`w-full ${theme.settings.input} text-sm transition-all focus:outline-none flex justify-between items-center py-2 px-3 border border-pink-200/50 shadow-sm`}
                        >
                            <span>
                                {i18n.language?.startsWith('en') ? `${t('settings.langEn')} (English)` : `${t('settings.langKo')} (Korean)`}
                            </span>
                            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isLangDropdownOpen ? 'rotate-180' : ''} ${currentTheme === 'princess' ? 'text-[#FF6B81]' : (currentTheme === 'excel' ? 'text-[#217346]' : 'text-slate-400')}`} />
                        </button>
                        
                        {isLangDropdownOpen && (
                            <div 
                                className={`absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto z-50 shadow-xl border custom-scrollbar transition-all animate-in fade-in slide-in-from-top-2 duration-200 ${
                                    currentTheme === 'princess' 
                                        ? 'bg-white/95 backdrop-blur-md border-[#FFD1DC] rounded-[16px] text-slate-800' 
                                        : (currentTheme === 'excel' 
                                            ? 'bg-[#F3F2F1] border-[#D1D1D1] text-slate-800' 
                                            : 'bg-[#252526] border-[#3E3E42] text-[#D4D4D4] rounded-lg')
                                }`}
                            >
                                {[
                                    { value: 'ko', label: `${t('settings.langKo')} (Korean)` },
                                    { value: 'en', label: `${t('settings.langEn')} (English)` }
                                ].map((opt) => {
                                    const isSelected = (opt.value === 'en' && i18n.language?.startsWith('en')) || (opt.value === 'ko' && !i18n.language?.startsWith('en'));
                                    let hoverClass = '';
                                    if (currentTheme === 'princess') {
                                        hoverClass = isSelected ? 'bg-[#FFE4E1] text-[#FF6B81] font-bold' : 'hover:bg-[#FFF0F5] text-slate-700';
                                    } else if (currentTheme === 'excel') {
                                        hoverClass = isSelected ? 'bg-[#E1DFDD] text-[#217346] font-bold' : 'hover:bg-[#EDEBE9] text-slate-700';
                                    } else {
                                        hoverClass = isSelected ? 'bg-[#007ACC] text-white font-bold' : 'hover:bg-[#2D2D30] text-[#ABB2BF]';
                                    }

                                    return (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => {
                                                i18n.changeLanguage(opt.value);
                                                setIsLangDropdownOpen(false);
                                            }}
                                            className={`w-full text-left py-2 px-3 text-xs sm:text-sm font-medium transition-colors flex items-center justify-between border-b last:border-b-0 ${
                                                currentTheme === 'princess' ? 'border-[#FFF0F5]' : (currentTheme === 'excel' ? 'border-[#E1E1E1]' : 'border-[#2D2D30]')
                                            } ${hoverClass}`}
                                        >
                                            <span>{opt.label}</span>
                                            {isSelected && (
                                                <Check className={`w-3.5 h-3.5 ${
                                                    currentTheme === 'princess' ? 'text-[#FF6B81]' : 
                                                    (currentTheme === 'excel' ? 'text-[#107C41]' : 'text-[#61AFEF]')
                                                }`} />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions Footer */}
            <div className={`flex flex-col sm:flex-row items-center justify-center gap-3 pt-6 border-t ${theme.divider} mt-6 max-w-md mx-auto`}>
                <button
                    onClick={openOnboardingGuide}
                    className={`text-xs px-4 py-2 transition-all font-bold flex items-center justify-center gap-2 ${theme.buttons.outlineBtn} w-full sm:w-auto`}
                >
                    <BookOpen className="w-3.5 h-3.5" />
                    {t('settings.userGuide')}
                </button>
                {user && user.uid === "guest_user" ? (
                    <button
                        onClick={onLoginClick}
                        className={`text-xs px-4 py-2 transition-all font-bold flex items-center justify-center gap-2 ${theme.buttons.outlineBtn} w-full sm:w-auto`}
                    >
                        <span className={theme.iconType === 'table' ? "opacity-100" : ""}>🔑</span> {t('settings.login')}
                    </button>
                ) : (
                    <>
                        <button
                            onClick={() => { if(onSignOut) onSignOut(); onClose(); }}
                            className={`text-xs px-4 py-2 transition-all font-bold flex items-center justify-center gap-2 ${theme.buttons.outlineBtn} w-full sm:w-auto`}
                        >
                            <span className={theme.iconType === 'table' ? "opacity-100" : ""}>🚪</span> {t('settings.logout')}
                        </button>
                        <button
                            onClick={onDeleteAccount}
                            className={`text-xs px-4 py-2 transition-all font-bold flex items-center justify-center gap-2 ${theme.buttons.dangerBtn} w-full sm:w-auto`}
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            {t('settings.deleteAccount')}
                        </button>
                    </>
                )}
                <button
                    onClick={handleResetRequest}
                    className={`text-xs px-4 py-2 transition-all font-bold flex items-center justify-center gap-2 ${isResetConfirming ? 'bg-red-600 text-white animate-pulse shadow-lg scale-105 ' + theme.radius : theme.buttons.dangerBtn} w-full sm:w-auto`}
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    {isResetConfirming ? t('settings.areYouSure') : t('settings.reset')}
                </button>
            </div>

            {/* 🏷️ Version Info */}
            <div className={`text-center mt-5 text-[10px] opacity-40 select-none ${
                currentTheme === 'developer' ? 'font-mono' : currentTheme === 'princess' ? 'font-gamja font-bold' : 'font-sans'
            }`}>
                {currentTheme === 'developer' ? `// version ${packageJson.version}` : `${t('settings.version')} ${packageJson.version}`}
            </div>


        </div>
    );
};

export default SettingsPanel;
