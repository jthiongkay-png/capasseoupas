import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors, ThemeColors } from '@/constants/colors';

const LAST_UPDATED = '12 mars 2026';

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  console.log('[Privacy] Screen loaded');

  return (
    <View style={styles.container} testID="privacy-screen">
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Politique de confidentialité',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.textPrimary,
          headerBackTitle: 'Retour',
          headerShadowVisible: false,
        }}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.dateBadge}>
          <Text style={styles.lastUpdated}>Dernière mise à jour : {LAST_UPDATED}</Text>
        </View>

        <Text style={styles.intro}>
          La présente Politique de Confidentialité décrit la manière dont Capasseoupas (ci-après « nous », « notre » ou « l'Éditeur ») collecte, utilise et protège vos données personnelles lorsque vous utilisez l'application Capasseoupas (ci-après « l'Application »), conformément au Règlement Général sur la Protection des Données (RGPD - Règlement UE 2016/679) et à la loi n°78-17 du 6 janvier 1978 relative à l'informatique, aux fichiers et aux libertés.
        </Text>

        <View style={styles.sectionCard}>
          <Text style={styles.heading}>1. Responsable du traitement</Text>
          <Text style={styles.body}>
            Le responsable du traitement des données personnelles est Capasseoupas, joignable à l'adresse : contact@capasseoupas.app.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.heading}>2. Données collectées</Text>
          <Text style={styles.body}>
            Dans le cadre de l'utilisation de l'Application, nous pouvons collecter les données suivantes :
          </Text>
          <Text style={styles.subheading}>2.1 Données fournies par l'utilisateur</Text>
          <Text style={styles.bullet}>• Données d'inscription : adresse e-mail, nom d'utilisateur choisi, méthode d'authentification (Google, Apple ou e-mail).</Text>
          <Text style={styles.bullet}>• Signalements de lieux (nom du commerce, adresse, catégorie, statut d'acceptation Amex).</Text>
          <Text style={styles.bullet}>• Commentaires optionnels associés aux signalements.</Text>
          <Text style={styles.subheading}>2.2 Données collectées automatiquement</Text>
          <Text style={styles.bullet}>• Identifiant unique de l'utilisateur (généré lors de la création du compte).</Text>
          <Text style={styles.bullet}>• Données de géolocalisation (uniquement lorsque vous autorisez l'accès à votre position, pour afficher la carte et les lieux à proximité).</Text>
          <Text style={styles.bullet}>• Données techniques (type d'appareil, système d'exploitation, version de l'Application).</Text>
          <Text style={styles.bullet}>• Identifiants publicitaires (IDFA/GAID) pour la personnalisation des publicités via Google AdMob.</Text>
          <Text style={styles.bullet}>• Données d'utilisation et d'interaction avec l'Application (pages consultées, actions effectuées).</Text>
          <Text style={styles.subheading}>2.3 Données que nous ne collectons PAS</Text>
          <Text style={styles.bullet}>• Données bancaires ou informations relatives à vos cartes de paiement.</Text>
          <Text style={styles.bullet}>• Données sensibles au sens de l'article 9 du RGPD.</Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.heading}>3. Finalités et bases légales du traitement</Text>
          <Text style={styles.body}>
            Vos données sont traitées pour les finalités suivantes :
          </Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tableCellHeader]}>Finalité</Text>
              <Text style={[styles.tableCell, styles.tableCellHeader]}>Base légale</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Création et gestion du compte utilisateur</Text>
              <Text style={styles.tableCell}>Exécution du contrat (Art. 6.1.b RGPD)</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Authentification via Google, Apple ou e-mail</Text>
              <Text style={styles.tableCell}>Exécution du contrat (Art. 6.1.b RGPD)</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Affichage des lieux sur la carte</Text>
              <Text style={styles.tableCell}>Intérêt légitime (Art. 6.1.f RGPD)</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Enregistrement et affichage des signalements</Text>
              <Text style={styles.tableCell}>Intérêt légitime (Art. 6.1.f RGPD)</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Géolocalisation pour afficher les lieux proches</Text>
              <Text style={styles.tableCell}>Consentement (Art. 6.1.a RGPD)</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Affichage de publicités personnalisées (Google AdMob)</Text>
              <Text style={styles.tableCell}>Consentement (Art. 6.1.a RGPD)</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Amélioration de l'Application et correction de bugs</Text>
              <Text style={styles.tableCell}>Intérêt légitime (Art. 6.1.f RGPD)</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.heading}>4. Durée de conservation</Text>
          <Text style={styles.body}>
            Les signalements sont conservés tant qu'ils sont pertinents pour la communauté. Les données techniques sont conservées pour une durée maximale de 12 mois. Vous pouvez demander la suppression de vos contributions à tout moment en nous contactant.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.heading}>5. Publicités et partenaires publicitaires</Text>
          <Text style={styles.body}>
            L'Application utilise Google AdMob pour afficher des publicités. Google AdMob peut collecter et utiliser certaines données pour personnaliser les publicités affichées, notamment :
          </Text>
          <Text style={styles.bullet}>• Identifiants publicitaires de votre appareil (IDFA sur iOS, GAID sur Android).</Text>
          <Text style={styles.bullet}>• Données d'utilisation de l'Application (interactions, pages consultées).</Text>
          <Text style={styles.bullet}>• Données techniques (type d'appareil, système d'exploitation, adresse IP).</Text>
          <Text style={styles.bullet}>• Données de localisation approximative.</Text>
          <Text style={styles.body}>
            Vous pouvez gérer vos préférences publicitaires dans les paramètres de votre appareil ou en désactivant la personnalisation des annonces. Pour plus d'informations sur les pratiques de Google en matière de confidentialité, consultez : https://policies.google.com/privacy
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.heading}>6. Partage des données</Text>
          <Text style={styles.body}>
            Vos données peuvent être partagées dans les cas suivants :
          </Text>
          <Text style={styles.bullet}>• Avec Google AdMob pour l'affichage de publicités personnalisées, conformément à votre consentement.</Text>
          <Text style={styles.bullet}>• Avec des prestataires techniques nécessaires au fonctionnement de l'Application (hébergement, services cartographiques, services d'authentification), agissant en tant que sous-traitants conformément à l'article 28 du RGPD.</Text>
          <Text style={styles.bullet}>• Avec Google et Apple dans le cadre de l'authentification via leurs services respectifs.</Text>
          <Text style={styles.bullet}>• Si la loi l'exige, sur demande d'une autorité judiciaire ou administrative compétente.</Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.heading}>7. Transferts de données hors UE</Text>
          <Text style={styles.body}>
            Certains de nos prestataires techniques (notamment les services cartographiques Google Maps) peuvent traiter des données en dehors de l'Union européenne. Dans ce cas, des garanties appropriées sont mises en place conformément au chapitre V du RGPD, notamment les clauses contractuelles types adoptées par la Commission européenne ou le cadre de protection des données UE-États-Unis (EU-US Data Privacy Framework).
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.heading}>8. Sécurité des données</Text>
          <Text style={styles.body}>
            Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, altération, divulgation ou destruction, conformément à l'article 32 du RGPD. Cela inclut le chiffrement des données en transit et la limitation de l'accès aux données au personnel autorisé.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.heading}>9. Vos droits</Text>
          <Text style={styles.body}>
            Conformément au RGPD et à la loi Informatique et Libertés, vous disposez des droits suivants :
          </Text>
          <Text style={styles.bullet}>• Droit d'accès (Art. 15 RGPD) : obtenir une copie de vos données personnelles.</Text>
          <Text style={styles.bullet}>• Droit de rectification (Art. 16 RGPD) : corriger des données inexactes.</Text>
          <Text style={styles.bullet}>• Droit à l'effacement (Art. 17 RGPD) : demander la suppression de vos données.</Text>
          <Text style={styles.bullet}>• Droit à la limitation du traitement (Art. 18 RGPD) : restreindre l'utilisation de vos données.</Text>
          <Text style={styles.bullet}>• Droit à la portabilité (Art. 20 RGPD) : recevoir vos données dans un format structuré.</Text>
          <Text style={styles.bullet}>• Droit d'opposition (Art. 21 RGPD) : vous opposer au traitement de vos données.</Text>
          <Text style={styles.bullet}>• Droit de retirer votre consentement à tout moment pour les traitements fondés sur le consentement.</Text>
          <Text style={styles.body}>
            Pour exercer ces droits, contactez-nous à : contact@capasseoupas.app. Nous répondrons à votre demande dans un délai de 30 jours conformément au RGPD.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.heading}>10. Réclamation auprès de la CNIL</Text>
          <Text style={styles.body}>
            Si vous estimez que le traitement de vos données personnelles constitue une violation du RGPD, vous avez le droit d'introduire une réclamation auprès de la Commission Nationale de l'Informatique et des Libertés (CNIL) :
          </Text>
          <Text style={styles.bullet}>• En ligne : www.cnil.fr</Text>
          <Text style={styles.bullet}>• Par courrier : CNIL, 3 Place de Fontenoy, TSA 80715, 75334 Paris Cedex 07, France</Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.heading}>11. Cookies et technologies similaires</Text>
          <Text style={styles.body}>
            L'Application n'utilise pas de cookies au sens traditionnel. Cependant, les technologies suivantes sont utilisées :
          </Text>
          <Text style={styles.bullet}>• Stockage local sécurisé pour vos données de session et préférences.</Text>
          <Text style={styles.bullet}>• Identifiants publicitaires pour la personnalisation des annonces via Google AdMob.</Text>
          <Text style={styles.bullet}>• Tokens d'authentification pour maintenir votre connexion.</Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.heading}>12. Protection des mineurs</Text>
          <Text style={styles.body}>
            L'Application n'est pas destinée aux enfants de moins de 16 ans. Nous ne collectons pas sciemment de données personnelles de mineurs. Si vous êtes parent ou tuteur et que vous pensez que votre enfant nous a communiqué des données, veuillez nous contacter pour que nous puissions les supprimer.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.heading}>13. Modération du contenu et signalement d'abus</Text>
          <Text style={styles.body}>
            Capasseoupas met en place un système de modération pour garantir la qualité et la fiabilité des informations partagées par la communauté :
          </Text>
          <Text style={styles.subheading}>13.1 Mécanismes de signalement</Text>
          <Text style={styles.bullet}>• Chaque fiche de lieu dispose d'un bouton « Signaler un problème » permettant de signaler des informations incorrectes, du contenu inapproprié ou des doublons.</Text>
          <Text style={styles.bullet}>• Les signalements sont examinés par notre équipe dans un délai raisonnable.</Text>
          <Text style={styles.bullet}>• Vous pouvez également nous contacter directement à contact@capasseoupas.app pour signaler tout abus.</Text>
          <Text style={styles.subheading}>13.2 Politique de modération</Text>
          <Text style={styles.bullet}>• Les contenus signalés comme inappropriés, inexacts ou abusifs sont examinés et peuvent être supprimés sans préavis.</Text>
          <Text style={styles.bullet}>• Les utilisateurs qui publient de manière répétée du contenu abusif, trompeur ou contraire aux bonnes pratiques peuvent voir leur accès restreint ou supprimé.</Text>
          <Text style={styles.bullet}>• Nous nous réservons le droit de bloquer tout utilisateur en cas de comportement abusif, conformément à nos Conditions Générales d'Utilisation.</Text>
          <Text style={styles.subheading}>13.3 Contact pour signalement d'abus</Text>
          <Text style={styles.body}>
            Pour signaler tout contenu abusif, inapproprié ou toute violation de nos conditions d'utilisation, vous pouvez nous contacter à : contact@capasseoupas.app. Nous nous engageons à traiter chaque signalement dans un délai de 48 heures ouvrées.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.heading}>14. Modifications de la Politique</Text>
          <Text style={styles.body}>
            Nous pouvons mettre à jour cette Politique de Confidentialité à tout moment. En cas de modification substantielle, nous vous en informerons via l'Application. Nous vous encourageons à consulter régulièrement cette page.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.heading}>15. Contact</Text>
          <Text style={styles.body}>
            Pour toute question relative à cette Politique de Confidentialité, à vos données personnelles, ou pour signaler un abus, contactez-nous à : contact@capasseoupas.app
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  dateBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.searchBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  lastUpdated: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: colors.textTertiary,
  },
  intro: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 12,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heading: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    marginBottom: 10,
  },
  subheading: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    marginTop: 12,
    marginBottom: 6,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 8,
  },
  bullet: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 4,
    paddingLeft: 12,
  },
  table: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableCell: {
    flex: 1,
    fontSize: 12,
    fontWeight: '400' as const,
    color: colors.textSecondary,
    padding: 10,
    lineHeight: 18,
  },
  tableCellHeader: {
    fontWeight: '600' as const,
    color: colors.textPrimary,
    backgroundColor: colors.searchBg,
  },
});
