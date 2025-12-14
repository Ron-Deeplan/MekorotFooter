import React, { useEffect, useState } from "react";
import styles from "./MekorotFooterWebPart.module.scss";
import { FooterService } from "../service/footer.service";

export interface FooterCMPProps {
    title?: string;
    contactListId: string;
}

export default function MekorotFooterWebPart({ title, contactListId }: FooterCMPProps): React.ReactElement {
    const footerService = new FooterService();
    const [contacts, setContacts] = useState<any[]>([]);
    const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
    const [contactsByCategory, setContactsByCategory] = useState<Map<string, any[]>>(new Map());
    const [showLogo, setShowLogo] = useState<boolean>(false);
    const [showCopyFeedback, setShowCopyFeedback] = useState<boolean>(false);
    const isMobile = window.innerWidth < 768;
    const waterNetVersion = 3.61;

    // data-automationid="SimpleFooter"
    // id="CommentsWrapper"

    useEffect(() => {
        footerService.getFooterContacts(contactListId).then((contacts) => {
            setContacts(contacts);
        });
        footerService.getContactCategoryOptions(contactListId).then((categories) => {
            setCategoryOptions(categories || []);
        });
        window.innerWidth < 1450 ? setShowLogo(false) : setShowLogo(true);
    }, []);

    // Group contacts by category whenever contacts or categoryOptions change
    useEffect(() => {
        if (contacts.length > 0 && categoryOptions.length > 0) {
            const groupedMap = new Map<string, any[]>();

            // Initialize map with all categories (even if empty)
            categoryOptions.forEach((category) => {
                groupedMap.set(category, []);
            });

            // Group contacts by their Category
            contacts.forEach((contact) => {
                const category = contact.Category;
                if (category && groupedMap.has(category)) {
                    const existingContacts = groupedMap.get(category) || [];
                    groupedMap.set(category, [...existingContacts, contact]);
                }
            });

            setContactsByCategory(groupedMap);
        }
    }, [contacts, categoryOptions]);

    const handleCopyPhoneNumber = async (phoneNumber: string, event: React.MouseEvent) => {
        event.preventDefault();
        try {
            await navigator.clipboard.writeText(phoneNumber);
            setShowCopyFeedback(true);
            setTimeout(() => setShowCopyFeedback(false), 2000);
        } catch (err) {
            // Fallback for older browsers that don't support Clipboard API
            const textArea = document.createElement("textarea");
            textArea.value = phoneNumber;
            textArea.style.position = "fixed";
            textArea.style.opacity = "0";
            document.body.appendChild(textArea);
            textArea.select();
            // eslint-disable-next-line deprecation/deprecation
            document.execCommand("copy");
            document.body.removeChild(textArea);
            setShowCopyFeedback(true);
            setTimeout(() => setShowCopyFeedback(false), 2000);
        }
    };

    const singleCategoryRender = (category: string) => {
        return (
            <div className={styles.ContactInfoSingleItem}>
                <span className={styles.singleItemIconArea}>
                    <img src={require("../assets/ExploreIcon.svg")} style={{ width: "20px", height: "20px" }} alt="Explore" />
                </span>
                <div className={styles.singleItemContentArea}>
                    <span className={styles.categoryTitleText}>{category}</span>
                    <div className={styles.contactInfoArea}>
                        <div className={styles.singleItemDisplayArea}>
                            {contactsByCategory.get(category)?.map((contact: any) => {
                                return (
                                    <div className={styles.singleItemDisplay}>
                                        <span className={styles.singleItemTitleText}>{contact.Title}</span>
                                        {isMobile ? (
                                            <span className={styles.singleItemPhoneNumberText}>
                                                <a
                                                    href={`tel:${contact.phoneNumber}`}
                                                    style={{ textDecoration: "none", color: "#123541" }}
                                                >
                                                    {contact.phoneNumber}
                                                </a>
                                            </span>
                                        ) : (
                                            <span
                                                className={styles.singleItemPhoneNumberText}
                                                onClick={(e) => handleCopyPhoneNumber(contact.phoneNumber, e)}
                                            >
                                                {contact.phoneNumber}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Render return
    return (
        <div className={styles.footerCMPContainer}>
            <div className={styles.FooterTitle}>
                <span>{title}</span>
            </div>
            <div className={styles.ContactContainer}>
                <div className={styles.ContactInfo}>
                    {categoryOptions.map((category) => {
                        return singleCategoryRender(category);
                    })}
                </div>
                {showLogo && (
                    <div className={styles.LogoVersionArea}>
                        <img src={require("../assets/MekorotFooterLogo.svg")} className={styles.LogoContainer} />
                        <span className={styles.waterNetVersion}>{`WaterNet version ${waterNetVersion.toString()}`}</span>
                    </div>
                )}
            </div>
            {showCopyFeedback && <div className={styles.copyFeedback}>מספר הטלפון הועתק</div>}
            {/* </div> */}
        </div>
    );
}
