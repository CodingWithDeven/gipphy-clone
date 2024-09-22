import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { GifState } from "../context/gif-context";
import Gif from "../components/gif";
import FollowOn from "../components/follow-on";

import { HiOutlineExternalLink } from "react-icons/hi";
import {
  HiMiniChevronDown,
  HiMiniChevronUp,
  HiMiniHeart,
} from "react-icons/hi2";
import { FaPaperPlane } from "react-icons/fa6";
import { IoCodeSharp } from "react-icons/io5";

const contentType = ["gifs", "stickers", "texts"];

const GifPage = () => {
  const { type, slug } = useParams();
  const [gif, setGif] = useState({});
  const [relatedGifs, setRelatedGifs] = useState([]);
  const [readMore, setReadMore] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isPlaneHovering, setIsPlaneHovering] = useState(false);
  const [isEmbedHovering, setIsEmbedHovering] = useState(false);
  const embedButtonClass = isEmbedHovering ? "embed-button-hover" : "";

  const { gf, addToFavorites, favorites } = GifState();

  useEffect(() => {
    if (!contentType.includes(type)) {
      throw new Error("Invalid Content Type");
    }
    const fetchGif = async () => {
      const gifId = slug.split("-");
      const { data } = await gf.gif(gifId[gifId.length - 1]);
      const { data: related } = await gf.related(gifId[gifId.length - 1], {
        limit: 10,
      });
      setGif(data);
      setRelatedGifs(related);
    };

    fetchGif();
  }, [type, slug, gf]);

  const shareGif = () => {
    const shareUrl = `${window.location.origin}/gif/${type}/${slug}`;
    if (navigator.share) {
      navigator
        .share({
          title: gif.title,
          text: "Check out this GIF!",
          url: shareUrl,
        })
        .then(() => console.log("Successful share"))
        .catch((error) => console.log("Error sharing", error));
    } else {
      navigator.clipboard.writeText(shareUrl).then(
        () => alert("GIF URL copied to clipboard!"),
        (err) => console.error("Could not copy text: ", err)
      );
    }
  };

  const EmbedGif = () => {
    const embedCode = `<iframe src="${gif.url}" width="480" height="270" frameBorder="0" class="giphy-embed" allowFullScreen></iframe>`;
    navigator.clipboard.writeText(embedCode).then(
      () => alert("Embed code copied to clipboard!"),
      (err) => console.error("Could not copy text: ", err)
    );
  };

  return (
    <div className="grid grid-cols-4 my-10 gap-4">
      <div className="hidden sm:block">
        {gif?.user && (
          <>
            <div className="flex gap-1">
              <img
                src={gif?.user?.avatar_url}
                alt={gif?.user?.display_name}
                className="h-14"
              />
              <div className="px-2">
                <div className="font-bold">{gif?.user?.display_name}</div>
                <div className="faded-text">@{gif?.user?.username}</div>
              </div>
            </div>
            {gif?.user?.description && (
              <p className="py-4 whitespace-pre-line text-sm text-gray-400">
                {readMore
                  ? gif?.user?.description
                  : gif?.user?.description.slice(0, 100) + "..."}
                <div
                  className="flex items-center faded-text cursor-pointer"
                  onClick={() => setReadMore(!readMore)}
                >
                  {readMore ? (
                    <>
                      Read less <HiMiniChevronUp size={20} />
                    </>
                  ) : (
                    <>
                      Read more <HiMiniChevronDown size={20} />
                    </>
                  )}
                </div>
              </p>
            )}
          </>
        )}
        <FollowOn />

        <div className="divider" />

        {gif?.source && (
          <div>
            <span className="faded-text">Source</span>
            <div className="flex items-center text-sm font-bold gap-1">
              <HiOutlineExternalLink size={25} />
              <a href={gif.source} target="_blank" className="truncate">
                {gif.source}
              </a>
            </div>
          </div>
        )}
      </div>

      <div className="col-span-4 sm:col-span-3">
        <div className="flex gap-6">
          <div className="w-full sm:w-3/4">
            <div className="faded-text truncate mb-2">{gif.title}</div>
            <Gif gif={gif} hover={false} />

            {/* -- Mobile UI -- */}
            <div className="flex sm:hidden gap-1">
              <img
                src={gif?.user?.avatar_url}
                alt={gif?.user?.display_name}
                className="h-14"
              />
              <div className="px-2">
                <div className="font-bold">{gif?.user?.display_name}</div>
                <div className="faded-text">@{gif?.user?.username}</div>
              </div>

              <button className="ml-auto" onClick={shareGif}>
                <FaPaperPlane size={25} />
              </button>
            </div>
            {/* -- Mobile UI -- */}
          </div>

          <div className="hidden sm:flex flex-col mt-6 gap-5">
            <button
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              onClick={() => addToFavorites(gif.id)}
              className="flex items-center font-bold text-lg relative gap-3"
            >
              <HiMiniHeart
                size={30}
                className={`heart-icon absolute top-0 left-0 transition-transform transform ${
                  favorites.includes(gif.id) ? "text-red-500" : ""
                } ${isHovering ? "animate-pulse" : ""}`}
              />
              <span className="ml-9">Favorite</span>
            </button>

            <button
              onMouseEnter={() => setIsPlaneHovering(true)}
              onMouseLeave={() => setIsPlaneHovering(false)}
              onClick={shareGif}
              className="flex items-center font-bold text-lg relative gap-3"
            >
              <FaPaperPlane
                size={25}
                className={`transition-transform transform ${
                  isPlaneHovering ? "animate-fly" : ""
                }`}
              />
              <span className="ml-0.7">Share</span>
            </button>

            <button
              onMouseEnter={() => setIsEmbedHovering(true)}
              onMouseLeave={() => setIsEmbedHovering(false)}
              onClick={EmbedGif}
              className={`flex items-center font-bold text-lg relative gap-3 ${embedButtonClass}`}
            >
              <IoCodeSharp size={30} className="code-icon" />
              <span className="mr-0.5">Embed</span>
            </button>
          </div>
        </div>

        <div>
          <span className="font-extrabold">Related GIFs</span>
          <div className="columns-2 md:columns-3 gap-2">
            {relatedGifs.slice(1).map((gif) => (
              <Gif gif={gif} key={gif.id} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GifPage;
