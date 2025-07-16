import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Star } from 'lucide-react';

const countryToEmoji = {
    "미국": "🇺🇸", "일본": "🇯🇵", "유럽": "🇪🇺", "중국": "🇨🇳", "동남아": "🌏", "기타": "🌍",
    "한국": "🇰🇷", "캐나다": "🇨🇦", "호주": "🇦🇺"
};

const levelStyles = [
    { name: "Bronze", color: "border-amber-600 bg-amber-100 text-amber-800", stars: 1 },
    { name: "Silver", color: "border-slate-500 bg-slate-200 text-slate-800", stars: 2 },
    { name: "Gold", color: "border-yellow-500 bg-yellow-200 text-yellow-800", stars: 3 },
    { name: "Platinum", color: "border-cyan-500 bg-cyan-200 text-cyan-800", stars: 4 },
    { name: "Diamond", color: "border-violet-500 bg-violet-300 text-violet-900", stars: 5 },
];

export default function CountryBadge({ country, level }) {
    const currentLevel = Math.min(level - 1, levelStyles.length - 1);
    const style = levelStyles[currentLevel];
    
    return (
        <div className={`relative p-3 rounded-xl border-2 text-center shadow-md transition-all hover:scale-105 ${style.color}`}>
            <div className="text-4xl mb-2">{countryToEmoji[country] || "🏴‍☠️"}</div>
            <p className="font-bold text-sm">{country}</p>
            <div className="flex justify-center mt-1">
                {Array.from({ length: style.stars }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 text-yellow-500 fill-current" />
                ))}
            </div>
            <Badge className="absolute -top-2 -right-2 bg-white text-gray-800 border-gray-300">{`Lv.${level}`}</Badge>
        </div>
    );
}