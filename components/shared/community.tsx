"use client";

import React, { Suspense, useCallback, useEffect, useReducer } from "react";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Post, UserDetail } from "@/types/types";
import PostCard from "./Post/PostCard";
import Loading from "../Loading/Loading";

// Define actions for the reducer
type Action =
  | { type: "SET_POSTS"; posts: Post[]; page: number }
  | { type: "SET_NEXT"; isNext: boolean }
  | { type: "SET_INPUT_VALUE"; inputValue: string };

interface State {
  posts: Post[];
  inputValue: string;
  isNext: boolean;
}

interface AvatarProps {
  searchParams?: { [key: string]: string | undefined };
}

// Initial state
const initialState: State = {
  posts: [],
  inputValue: "",
  isNext: false,
};

// Reducer function
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_POSTS":
      return {
        ...state,
        posts:
          action.page === 1 ? action.posts : [...state.posts, ...action.posts],
      };
    case "SET_NEXT":
      return { ...state, isNext: action.isNext };
    case "SET_INPUT_VALUE":
      return { ...state, inputValue: action.inputValue };
    default:
      return state;
  }
}

const Community = ({ searchParams = {} }: AvatarProps) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { posts, inputValue, isNext } = state;
  const router = useRouter();

  const fetchPosts = useCallback(async (query = "", page = 1) => {
    try {
      const response = await fetch(
        `/api/post?pageNumber=${page}&pageSize=20${query}`
      );
      const data = await response.json();
      dispatch({ type: "SET_POSTS", posts: data.posts, page });
      dispatch({ type: "SET_NEXT", isNext: data.isNext });
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  }, []);

  useEffect(() => {
    const query = searchParams.q ? `&q=${searchParams.q}` : "";
    const pageNumber = searchParams.page ? +searchParams.page : 1;
    fetchPosts(query, pageNumber);
  }, [searchParams, fetchPosts]);

  const handleSearchSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      const newParams = new URLSearchParams({
        q: inputValue,
        page: "1",
      });
      window.location.search = newParams.toString();
    },
    [inputValue]
  );

  const loadMorePosts = useCallback(() => {
    const currentPage = searchParams.page ? +searchParams.page : 1;
    const newPage = currentPage + 1;
    const newParams = new URLSearchParams({
      q: inputValue,
      page: newPage.toString(),
    });
    window.location.search = newParams.toString();
  }, [inputValue, searchParams.page]);

  const handleReadMore = (id: number) => {
    router.push(`/detail/${id}`);
  };

  return (
    <div className="min-h-[100vh] bg-light-1 dark:bg-zinc-900 text-gray-200 p-4">
      <div className="max-w-3xl mx-auto">
        <form className="flex mb-8" onSubmit={handleSearchSubmit}>
          <Input
            className="ml-4 w-full"
            type="text"
            placeholder="Search posts"
            value={inputValue}
            onChange={(e) =>
              dispatch({ type: "SET_INPUT_VALUE", inputValue: e.target.value })
            }
          />
          <Button type="submit" className="ml-4">
            Search
          </Button>
        </form>

        <Suspense fallback={<Loading />}>
          <PostCard posts={posts} />
        </Suspense>

        {isNext && (
          <div className="flex justify-center mt-8">
            <Button onClick={loadMorePosts}>Load more</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;
