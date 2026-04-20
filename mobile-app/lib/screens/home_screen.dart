import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'player_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text("Olá, Explorador!", style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                      Text("O que vamos assistir hoje?", style: TextStyle(color: Colors.white60)),
                    ],
                  ),
                  CircleAvatar(backgroundColor: Colors.orange, child: Icon(Icons.person, color: Colors.white)),
                ],
              ),
              const SizedBox(height: 32),
              
              const Text("CANAIS RECOMENDADOS", style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1.2)),
              const SizedBox(height: 16),
              
              // LIVE CHANNEL CARD
              _buildChannelCard(
                context,
                title: "Live: Brasil vs Argentina",
                subtitle: "Esportes • Latência Zero",
                icon: Icons.sports_soccer,
                color: Colors.green,
                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => 
                  const PlayerScreen(url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8", type: 'live'))),
              ),
              
              const SizedBox(height: 12),
              
              // VOD CHANNEL CARD
              _buildChannelCard(
                context,
                title: "VOD: Interstellar",
                subtitle: "Ficção • Dublagem IA Pronta",
                icon: Icons.movie,
                color: Colors.blue,
                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => 
                  const PlayerScreen(url: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8", type: 'vod'))),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildChannelCard(BuildContext context, {required String title, required String subtitle, required IconData icon, required Color color, required VoidCallback onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: const Color(0xFF1A0A2E),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
              child: Icon(icon, color: color),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  Text(subtitle, style: const TextStyle(color: Colors.white54, fontSize: 12)),
                ],
              ),
            ),
            const Icon(Icons.arrow_forward_ios, size: 16, color: Colors.white24),
          ],
        ),
      ).animate().fadeIn().slideX(begin: 0.1),
    );
  }
}
