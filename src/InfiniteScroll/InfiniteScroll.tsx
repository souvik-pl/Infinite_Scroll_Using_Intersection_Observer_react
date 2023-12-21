import { useEffect, useRef, useState } from "react";
import { InfiniteScrollProps, PostType } from "../models/models.type";
import styles from "./InfiniteScroll.module.css";

function InfiniteScroll(props: InfiniteScrollProps) {
    const count: number = 10;
    const [offset, setOffset] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isScrollbarAppeared, setIsScrollbarAppeared] = useState<boolean>(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const observerRef = useRef<HTMLDivElement>(null);
    const [isIntersecting, setIsIntersecting] = useState<boolean>(false);

    // This useEffect is for making the very first API call
    useEffect(() => {
        makeAPICall();
    }, [])

    // This useEffect will make sure to load subsequent set of data until scrollbar appears
    useEffect(() => {
        if (!isScrollbarAppeared && props.itemList.length > 0) {
            const isScrollAvailable: boolean = isScrollPresent();
            setIsScrollbarAppeared(isScrollAvailable);
            if (!isScrollAvailable) {
                makeAPICall();
            }
        }
    }, [props.itemList])

    // This useEffect will register the intersection observer as soon as the scrollbar appears.
    useEffect(() => {
        if (isScrollbarAppeared) {
            const observer = new IntersectionObserver((entries) => {
                const entry = entries[0];
                if (entry.isIntersecting) {
                    setIsIntersecting(true);
                }
            });

            observer.observe(observerRef.current!);
        }
    }, [isScrollbarAppeared])

    // This useEffect will make API call when user scrolls to the bottom of the list
    useEffect(() => {
        if (isIntersecting) {
            makeAPICall();
            setIsIntersecting(false);
        }
    }, [isIntersecting])

    async function makeAPICall() {
        setIsLoading(true);
        const data: PostType[] = await props.fetchData(props.baseUrl, offset, count);
        props.updateList(data);
        setOffset(offset + count);
        setIsLoading(false);
    }

    function isScrollPresent(): boolean {
        const clientHeight = containerRef.current!.clientHeight;
        const scrollHeight = containerRef.current!.scrollHeight;
        return scrollHeight > clientHeight;
    }

    return (
        <div className={styles.container} ref={containerRef}>
            {
                isLoading && (props.itemList.length === 0) ? props.loaderComponent() : (
                    props.itemList.map(item => props.listItemComponent(item.id, item.userId, item.title))
                )
            }
            {
                isScrollbarAppeared && (
                    <div className={styles.observer} ref={observerRef}></div>
                )
            }
        </div>
    )
}

export default InfiniteScroll;
